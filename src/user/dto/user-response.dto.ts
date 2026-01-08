// src/user/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../Schema/user.schema';

export class UserResponseDto {
  @ApiProperty({ example: '65b8f1d9a8a1f2c3d4e5f678' })
  id: string;

  @ApiProperty({ example: 'Ali Khan' })
  name: string;

  @ApiProperty({ example: 'ali@example.com' })
  email: string;

  @ApiProperty({ example: '+92 300 1234567' })
  phoneNumber: string;

  @ApiProperty({ enum: UserRole, example: UserRole.SERVICE_ADVISOR })
  role: UserRole;

  @ApiProperty({ example: '2026-01-08T10:20:30.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-08T10:20:30.000Z' })
  updatedAt: Date;
}
