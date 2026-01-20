// src/vehicle/vehicle.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle, VehicleDocument } from 'src/Schema/vehicle.schema';
import { AwsService } from 'src/aws/aws.service';
import { VehicleQueryDto } from './dto/vehicle-query.dto';

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<VehicleDocument>,
    private readonly awsService: AwsService,
  ) {}

  async create(dto: CreateVehicleDto) {
    try {
      const vehicle = await this.vehicleModel.create(dto);
      return vehicle;
    } catch (err: any) {
      // Unique chassisNumber violation
      if (err?.code === 11000) {
        throw new ConflictException('chassisNumber already exists');
      }
      throw err;
    }
  }

  async findOne(vehicleId: string) {
    const vehicle = await this.vehicleModel.findById(vehicleId).lean();

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.carImageKey) {
      try {
        const signedUrl = await this.awsService.getSignedUrl(
          vehicle.carImageKey,
        );
        (vehicle as any).carImageUrl = signedUrl;
      } catch {}
    }

    return vehicle;
  }

  async update(vehicleId: string, dto: UpdateVehicleDto) {
    const vehicle = await this.vehicleModel.findById(vehicleId);
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    // ✅ If car image is changing, delete old image first
    if (
      dto.carImageKey &&
      vehicle.carImageKey &&
      dto.carImageKey !== vehicle.carImageKey
    ) {
      await this.awsService.deleteFile(vehicle.carImageKey);
    }

    try {
      const updated = await this.vehicleModel.findByIdAndUpdate(
        vehicleId,
        { $set: dto },
        { new: true, runValidators: true },
      );

      if (!updated) throw new NotFoundException('Vehicle not found');
      return updated;
    } catch (err: any) {
      if (err?.code === 11000)
        throw new ConflictException('chassisNumber already exists');
      throw err;
    }
  }

  async delete(vehicleId: string) {
    const vehicle = await this.vehicleModel.findById(vehicleId);
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    // ✅ delete image first
    if (vehicle.carImageKey) {
      await this.awsService.deleteFile(vehicle.carImageKey);
    }

    await this.vehicleModel.deleteOne({ _id: vehicleId });
    return { message: 'Vehicle deleted successfully', id: vehicleId };
  }

  async findAll(query: VehicleQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.make)
      filter.make = new RegExp(`^${escapeRegex(query.make)}$`, 'i');
    if (query.model)
      filter.model = new RegExp(`^${escapeRegex(query.model)}$`, 'i');
    if (query.variant)
      filter.variant = new RegExp(`^${escapeRegex(query.variant)}$`, 'i');
    if (query.registrationNumber)
      filter.registrationNumber = new RegExp(
        escapeRegex(query.registrationNumber),
        'i',
      );
    if (query.chassisNumber)
      filter.chassisNumber = new RegExp(escapeRegex(query.chassisNumber), 'i');
    if (query.transmission) filter.transmission = query.transmission;
    if (query.yearOfManufacture)
      filter.yearOfManufacture = query.yearOfManufacture;

    if (query.search?.trim()) {
      const s = escapeRegex(query.search.trim());
      filter.$or = [
        { make: new RegExp(s, 'i') },
        { model: new RegExp(s, 'i') },
        { variant: new RegExp(s, 'i') },
        { registrationNumber: new RegExp(s, 'i') },
        { chassisNumber: new RegExp(s, 'i') },
      ];
    }

    const [items, totalItems] = await Promise.all([
      this.vehicleModel
        .find(filter)
        .select('-inspectionIds') // ✅ exclude inspectionIds
        .sort({ createdAt: -1 }) // ✅ latest first by createdAt
        .skip(skip)
        .limit(limit)
        .lean(),
      this.vehicleModel.countDocuments(filter),
    ]);

    // ✅ Attach signed URL if key is valid; if not, ignore errors and move on
    const itemsWithSignedUrls = await Promise.all(
      items.map(async (v: any) => {
        if (!v.carImageKey) return v;

        try {
          const signedUrl = await this.awsService.getSignedUrl(v.carImageKey);
          return { ...v, carImageUrl: signedUrl }; // add url in response
        } catch {
          return v; // key wrong/deleted -> just return without url
        }
      }),
    );

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return {
      items: itemsWithSignedUrls,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  async getVehicleCarImagePresigned(fileType: string) {
    this.validateImageMime(fileType);

    const ext = this.extFromMime(fileType);
    const fileName = `car-image.${ext}`; // your aws service adds uuid
    const folder = 'vehicles/car-images';

    return this.awsService.generatePresignedUrl(fileName, fileType, folder);
  }

  private validateImageMime(fileType: string) {
    if (!fileType || typeof fileType !== 'string') {
      throw new BadRequestException('fileType is required');
    }
    if (!fileType.startsWith('image/')) {
      throw new BadRequestException('Only image/* is allowed');
    }
  }

  private extFromMime(mime: string) {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic',
      'image/heif': 'heif',
      'image/gif': 'gif',
    };
    return map[mime] ?? 'bin';
  }
}
