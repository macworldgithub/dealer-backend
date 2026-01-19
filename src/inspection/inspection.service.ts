import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AwsService } from '../aws/aws.service';
import { UserRole } from 'src/Schema/user.schema';
import { Inspection, InspectionDocument } from 'src/Schema/inspection.schema';
import { Vehicle, VehicleDocument } from 'src/Schema/vehicle.schema';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { InspectionStatus } from './dto/update-inspect-status.dto';
import { InspectionByVehicleQueryDto } from './dto/inspection-by-vehicle-query.dto';

type AddImageInput = {
  originalImageKey: string;
};

type UpdateInspectionImageInput = {
  originalImageKey?: string; // if you allow changing original
  analysedImageKey?: string;
  aiRaw?: any;
  damages?: any[]; // or type Damage[]
};

type UpdateDamageInput = {
  type?: string;
  severity?: string;
  confidence?: number;
  bbox?: number[];
  description?: string;
  repair_cost_estimate?: { currency?: string; min?: number; max?: number };
};

@Injectable()
export class InspectionService {
  constructor(
    @InjectModel(Inspection.name)
    private readonly inspectionModel: Model<InspectionDocument>,

    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<VehicleDocument>,

    private readonly awsService: AwsService,
  ) {}

  // -------------------------
  // Create Inspection + link to Vehicle
  // -------------------------
  async createInspection(
    dto: CreateInspectionDto,
    inspectedBy: string, // from JWT
    inspectorRole: UserRole, // from JWT
  ) {
    const vehicle = await this.vehicleModel.findById(dto.vehicleId);
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    // Normalize images
    const images = (dto.images ?? []).map((img) => ({
      originalImageKey: img.originalImageKey,
      ...(img.analysedImageKey
        ? { analysedImageKey: img.analysedImageKey }
        : {}),
      ...(img.aiRaw !== undefined ? { aiRaw: img.aiRaw } : {}),
      damages: img.damages ?? [],
    }));

    // Create inspection
    const inspection = await this.inspectionModel.create({
      vehicleId: new Types.ObjectId(dto.vehicleId),
      inspectedBy: new Types.ObjectId(inspectedBy),
      inspectorRole,
      status: dto.status ?? InspectionStatus.DRAFT,
      images,
    });

    // Link inspectionId into vehicle
    try {
      await this.vehicleModel.updateOne(
        { _id: vehicle._id },
        { $push: { inspectionIds: inspection._id } },
      );
    } catch (e) {
      // rollback: delete inspection if linking fails
      await this.inspectionModel.deleteOne({ _id: inspection._id });
      throw e;
    }

    return inspection;
  }

  // -------------------------
  // Add Image (original key)
  // -------------------------
  async addImage(inspectionId: string, input: AddImageInput) {
    const updated = await this.inspectionModel.findByIdAndUpdate(
      inspectionId,
      {
        $push: {
          images: {
            originalImageKey: input.originalImageKey,
            analysedImageKey: undefined,
            aiRaw: undefined,
            damages: [],
          },
        },
      },
      { new: true },
    );

    if (!updated) throw new NotFoundException('Inspection not found');
    return updated;
  }

  // -------------------------
  // Update Image (keys + aiRaw + damages)
  // Deletes old S3 keys first if changed (as per your pattern)
  // -------------------------
  async updateImage(
    inspectionId: string,
    imageId: string,
    dto: UpdateInspectionImageInput,
  ) {
    const inspection = await this.inspectionModel.findById(inspectionId);
    if (!inspection) throw new NotFoundException('Inspection not found');

    const img = inspection.images?.find(
      (x: any) => x._id.toString() === imageId,
    );
    if (!img) throw new NotFoundException('Image not found');

    // delete old original if changed
    if (
      dto.originalImageKey &&
      img.originalImageKey &&
      dto.originalImageKey !== img.originalImageKey
    ) {
      await this.safeDeleteS3(img.originalImageKey);
    }

    // delete old analysed if changed
    if (
      dto.analysedImageKey &&
      img.analysedImageKey &&
      dto.analysedImageKey !== img.analysedImageKey
    ) {
      await this.safeDeleteS3(img.analysedImageKey);
    }

    const setObj: any = {};
    if (dto.originalImageKey !== undefined)
      setObj['images.$.originalImageKey'] = dto.originalImageKey;
    if (dto.analysedImageKey !== undefined)
      setObj['images.$.analysedImageKey'] = dto.analysedImageKey;
    if (dto.aiRaw !== undefined) setObj['images.$.aiRaw'] = dto.aiRaw;
    if (dto.damages !== undefined) setObj['images.$.damages'] = dto.damages;

    const updated = await this.inspectionModel.findOneAndUpdate(
      { _id: inspectionId, 'images._id': new Types.ObjectId(imageId) },
      { $set: setObj },
      { new: true, runValidators: true },
    );

    if (!updated) throw new NotFoundException('Inspection or image not found');
    return updated;
  }

  // -------------------------
  // Update ONE damage inside an image (by damageId)
  // Uses arrayFilters so you don't replace whole damages array
  // -------------------------
  async updateDamage(
    inspectionId: string,
    imageId: string,
    damageId: string,
    dto: UpdateDamageInput,
  ) {
    const $set: any = {};

    if (dto.type !== undefined)
      $set['images.$[img].damages.$[dmg].type'] = dto.type;
    if (dto.severity !== undefined)
      $set['images.$[img].damages.$[dmg].severity'] = dto.severity;
    if (dto.confidence !== undefined)
      $set['images.$[img].damages.$[dmg].confidence'] = dto.confidence;
    if (dto.bbox !== undefined)
      $set['images.$[img].damages.$[dmg].bbox'] = dto.bbox;
    if (dto.description !== undefined)
      $set['images.$[img].damages.$[dmg].description'] = dto.description;

    if (dto.repair_cost_estimate) {
      if (dto.repair_cost_estimate.currency !== undefined)
        $set['images.$[img].damages.$[dmg].repair_cost_estimate.currency'] =
          dto.repair_cost_estimate.currency;

      if (dto.repair_cost_estimate.min !== undefined)
        $set['images.$[img].damages.$[dmg].repair_cost_estimate.min'] =
          dto.repair_cost_estimate.min;

      if (dto.repair_cost_estimate.max !== undefined)
        $set['images.$[img].damages.$[dmg].repair_cost_estimate.max'] =
          dto.repair_cost_estimate.max;
    }

    const res = await this.inspectionModel.updateOne(
      { _id: new Types.ObjectId(inspectionId) },
      { $set },
      {
        arrayFilters: [
          { 'img._id': new Types.ObjectId(imageId) },
          { 'dmg._id': new Types.ObjectId(damageId) },
        ],
        runValidators: true,
      },
    );

    if (res.matchedCount === 0)
      throw new NotFoundException('Inspection/image/damage not found');

    // return updated doc (optional)
    return this.inspectionModel.findById(inspectionId);
  }

  // -------------------------
  // Delete inspection:
  // 1) delete S3 keys for all images
  // 2) delete inspection doc
  // 3) pull inspectionId from vehicle.inspectionIds
  // -------------------------
  async deleteInspection(inspectionId: string) {
    const inspection = await this.inspectionModel.findById(inspectionId);
    if (!inspection) throw new NotFoundException('Inspection not found');

    // delete all image keys (move on if any fail)
    for (const img of inspection.images || []) {
      if (img?.originalImageKey) await this.safeDeleteS3(img.originalImageKey);
      if (img?.analysedImageKey) await this.safeDeleteS3(img.analysedImageKey);
    }

    await this.inspectionModel.deleteOne({ _id: inspection._id });

    await this.vehicleModel.updateOne(
      { _id: inspection.vehicleId },
      { $pull: { inspectionIds: inspection._id } },
    );

    return { message: 'Inspection deleted successfully', id: inspectionId };
  }

  // -------------------------
  // Helpers
  // -------------------------
  private async safeDeleteS3(key: string) {
    try {
      await this.awsService.deleteFile(key);
    } catch {
      // ignore (as you requested: "if not then just move on")
    }
  }

  async changeStatus(inspectionId: string, status: InspectionStatus) {
    const allowed = Object.values(InspectionStatus);
    if (!allowed.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const updated = await this.inspectionModel.findByIdAndUpdate(
      new Types.ObjectId(inspectionId),
      { $set: { status } },
      { new: true, runValidators: true },
    );

    if (!updated) throw new NotFoundException('Inspection not found');
    return updated;
  }

  async getInspectionOriginalPresigned(fileType: string) {
    this.validateImageMime(fileType);

    const ext = this.extFromMime(fileType);
    const fileName = `original.${ext}`;
    const folder = 'inspections/original';

    return this.awsService.generatePresignedUrl(fileName, fileType, folder);
  }

  async getInspectionAnalysedPresigned(fileType: string) {
    this.validateImageMime(fileType);

    const ext = this.extFromMime(fileType);
    const fileName = `analysed.${ext}`;
    const folder = 'inspections/analysed';

    return this.awsService.generatePresignedUrl(fileName, fileType, folder);
  }

  async getInspectionDamagePresigned(fileType: string) {
    this.validateImageMime(fileType);

    const ext = this.extFromMime(fileType);
    const fileName = `damage.${ext}`;
    const folder = 'inspections/damages';

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

  async findByVehicleIdPaged(
    vehicleId: string,
    query: InspectionByVehicleQueryDto,
  ) {
    if (!Types.ObjectId.isValid(vehicleId))
      throw new BadRequestException('Invalid vehicleId');

    const vehicleObjId = new Types.ObjectId(vehicleId);

    const vehicleExists = await this.vehicleModel.exists({ _id: vehicleObjId });
    if (!vehicleExists) throw new NotFoundException('Vehicle not found');

    const filter: any = { vehicleId: vehicleObjId };

    // ✅ if inspectionId given, restrict to that inspection (still under vehicle)
    if (query.inspectionId) {
      if (!Types.ObjectId.isValid(query.inspectionId)) {
        throw new BadRequestException('Invalid inspectionId');
      }
      filter._id = new Types.ObjectId(query.inspectionId);
    }

    if (query.status) filter.status = query.status;
    if (query.inspectedBy)
      filter.inspectedBy = new Types.ObjectId(query.inspectedBy);
    if (query.inspectorRole) filter.inspectorRole = query.inspectorRole;

    // pagination still works (even though inspectionId will return max 1)
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      this.inspectionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: 'vehicleId', select: '-inspectionIds' })
        .populate({
          path: 'inspectedBy',
          select: 'name email phoneNumber role',
        })
        .lean(),
      this.inspectionModel.countDocuments(filter),
    ]);

    // If inspectionId was provided and nothing found -> 404
    if (query.inspectionId && items.length === 0) {
      throw new NotFoundException('Inspection not found for this vehicle');
    }

    // ✅ signed urls for images
    await Promise.all(
      items.map(async (ins: any) => {
        if (Array.isArray(ins.images)) {
          await Promise.all(
            ins.images.map(async (img: any) => {
              if (img?.originalImageKey) {
                try {
                  img.originalImageUrl = await this.awsService.getSignedUrl(
                    img.originalImageKey,
                  );
                } catch {}
              }
              if (img?.analysedImageKey) {
                try {
                  img.analysedImageUrl = await this.awsService.getSignedUrl(
                    img.analysedImageKey,
                  );
                } catch {}
              }
            }),
          );
        }
      }),
    );

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        vehicleId,
        ...(query.inspectionId ? { inspectionId: query.inspectionId } : {}),
      },
    };
  }

  async findOneWithRefs(inspectionId: string) {
    if (!Types.ObjectId.isValid(inspectionId)) {
      throw new BadRequestException('Invalid inspectionId');
    }

    const inspection = await this.inspectionModel
      .findById(new Types.ObjectId(inspectionId))
      .populate({ path: 'vehicleId', select: '-inspectionIds' })
      .populate({ path: 'inspectedBy', select: 'name email phoneNumber role' })
      .lean();

    if (!inspection) throw new NotFoundException('Inspection not found');

    // ✅ add signed urls for images (ignore invalid keys)
    if (Array.isArray((inspection as any).images)) {
      await Promise.all(
        (inspection as any).images.map(async (img: any) => {
          if (img?.originalImageKey) {
            try {
              img.originalImageUrl = await this.awsService.getSignedUrl(
                img.originalImageKey,
              );
            } catch {}
          }
          if (img?.analysedImageKey) {
            try {
              img.analysedImageUrl = await this.awsService.getSignedUrl(
                img.analysedImageKey,
              );
            } catch {}
          }
        }),
      );
    }

    return inspection;
  }
}
