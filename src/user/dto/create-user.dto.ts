// src/users/dto/create-user.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../Schema/user.schema';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class CreateUserDto {
  @ApiProperty({ example: 'Ali Khan', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ali@example.com', description: 'Unique email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+92 300 1234567', description: 'Phone number (string to support country codes)' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'Plain password (will be hashed before saving). Minimum 8 characters.',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.PORTER_DETAILER,
    description:
      'User role. PORTER_DETAILER=Capture only, SERVICE_ADVISOR=Edit/Send reports, SALES_INVENTORY_MANAGER=Merch/Templates, ADMIN=Config/Branding/Users/API keys',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

