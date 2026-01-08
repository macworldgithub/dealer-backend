// src/inspection/schemas/inspection.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  InspectionImage,
  InspectionImageSchema,
} from './inspection-image.schema';
import { UserRole } from './user.schema';

export type InspectionDocument = HydratedDocument<Inspection>;

@Schema({ timestamps: true })
export class Inspection {
  // ✅ link to vehicle
  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true, index: true })
  vehicleId: Types.ObjectId;

  // ✅ who inspected
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  inspectedBy: Types.ObjectId;

  // snapshot role at inspection time
  @Prop({ required: true, enum: Object.values(UserRole) })
  inspectorRole: UserRole;

  @Prop({ type: [InspectionImageSchema], default: [] })
  images: InspectionImage[];

  @Prop({ default: 'DRAFT' })
  status: 'DRAFT' | 'COMPLETED' | 'SENT';
}

export const InspectionSchema = SchemaFactory.createForClass(Inspection);

// helpful indexes
InspectionSchema.index({ vehicleId: 1, createdAt: -1 });
InspectionSchema.index({ inspectedBy: 1, createdAt: -1 });
InspectionSchema.index({ status: 1, createdAt: -1 });
