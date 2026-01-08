// src/users/users.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument, UserRole } from  '../Schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async createUser(dto: CreateUserDto) {
    const role = dto.role ?? UserRole.PORTER_DETAILER; // default role

    // (optional) extra guard if you want to control allowed roles strictly
    if (!Object.values(UserRole).includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.userModel.create({
        name: dto.name,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        role,
        password: hashedPassword,
      });

      // Because password has select:false, it won’t return anyway, but keep response clean:
      return {
        id:user._id.toString(),
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        //@ts-ignore
        createdAt: user.createdAt,
        //@ts-ignore
        updatedAt: user.updatedAt,
      };
    } catch (err: any) {
      // Mongo duplicate key error
      if (err?.code === 11000) {
        const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
        throw new ConflictException(`${field} already exists`);
      }
      throw err;
    }
  }

  // Useful for login flows where you need the password:
  async findByEmailWithPassword(email: string) {
    return this.userModel.findOne({ email }).select('+password');
  }
}
