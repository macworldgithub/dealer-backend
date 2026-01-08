// src/inspection/schemas/damage.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: true })
export class RepairCostEstimate {
  @Prop({ required: true, default: 'USD' })
  currency: string;

  @Prop({ required: true, min: 0 })
  min: number;

  @Prop({ required: true, min: 0 })
  max: number;
}
export const RepairCostEstimateSchema =
  SchemaFactory.createForClass(RepairCostEstimate);

@Schema({ _id: true })
export class Damage {
  @Prop({ required: true })
  type: string; // dent, paint_crack, scratch, etc.

  @Prop({ required: true })
  severity: string; // light/moderate/severe (or whatever AI sends)

  @Prop({ required: true, min: 0, max: 1 })
  confidence: number;

  @Prop({ type: [Number], required: true }) // [x1,y1,x2,y2]
  bbox: number[];

  @Prop()
  description?: string;

  @Prop({ type: RepairCostEstimateSchema })
  repair_cost_estimate?: RepairCostEstimate;
}
export const DamageSchema = SchemaFactory.createForClass(Damage);
