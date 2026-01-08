// src/inspection/schemas/inspection-image.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Damage, DamageSchema } from './damage.schema';

@Schema({ _id: true, timestamps: true })
export class InspectionImage {
  @Prop({ required: true })
  originalImageKey: string; // S3 key

  @Prop()
  analysedImageKey?: string; // S3 key (AI annotated)

  // Raw AI response (optional, helpful for debugging/versioning)
  @Prop({ type: Object })
  aiRaw?: any;

  @Prop({ type: [DamageSchema], default: [] })
  damages: Damage[];
}

export const InspectionImageSchema =
  SchemaFactory.createForClass(InspectionImage);
