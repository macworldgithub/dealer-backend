// src/vehicle/schemas/vehicle.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TransmissionType } from 'src/vehicle/enum/tranmission-type';


export type VehicleDocument = HydratedDocument<Vehicle>;


@Schema({ timestamps: true })
export class Vehicle {
  @Prop({ required: true, trim: true })
  make: string;

  @Prop({ required: true, trim: true })
  model: string;

  @Prop({ trim: true })
  variant?: string;

  @Prop({ required: true, min: 1900, max: 2100 })
  yearOfManufacture: number;

  @Prop({ required: true, trim: true, uppercase: true, index: true })
  registrationNumber: string;

  // ✅ Now unique per vehicle profile
  @Prop({
    required: true,
    trim: true,
    uppercase: true,
    unique: true,
    index: true,
  })
  chassisNumber: string;

  @Prop({ required: true, enum: Object.values(TransmissionType) })
  transmission: TransmissionType;

  // ✅ Car image (single main image)
  @Prop({ trim: true })
  carImageKey?: string;

  // Optional: keep more images too (uncomment if you want multiple)
  // @Prop({ type: [String], default: [] })
  // carImageUrls: string[];

  // Link inspection ids
  @Prop({ type: [Types.ObjectId], ref: 'Inspection', default: [] })
  inspectionIds: Types.ObjectId[];
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

// ✅ Unique index (extra explicit, helps ensure it’s created)
VehicleSchema.index({ chassisNumber: 1 }, { unique: true });

// Other helpful indexes
VehicleSchema.index({ registrationNumber: 1, createdAt: -1 });
