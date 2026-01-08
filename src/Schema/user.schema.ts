// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  PORTER_DETAILER = 'PORTER_DETAILER', // Capture only
  SERVICE_ADVISOR = 'SERVICE_ADVISOR', // Edit reports, send to customers
  SALES_INVENTORY_MANAGER = 'SALES_INVENTORY_MANAGER', // Merch workflow, template mgmt
  ADMIN = 'ADMIN', // Labour rate, branding, users, API keys
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ required: true, trim: true })
  phoneNumber: string;

  @Prop({
    required: true,
    enum: Object.values(UserRole),
    default: UserRole.PORTER_DETAILER,
  })
  role: UserRole;

  // Store hashed password ONLY (never store plain text)
  @Prop({
    required: true,
    minlength: 8,
    select: false, // prevents returning password in queries unless explicitly selected
  })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phoneNumber: 1 }, { unique: true });
