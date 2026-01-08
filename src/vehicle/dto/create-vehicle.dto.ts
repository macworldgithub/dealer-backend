// src/vehicle/dto/create-vehicle.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { TransmissionType } from '../enum/tranmission-type';


export class CreateVehicleDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @IsNotEmpty()
  make: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiPropertyOptional({ example: 'GLi' })
  @IsOptional()
  @IsString()
  variant?: string;

  @ApiProperty({ example: 2021 })
  @IsNumber()
  yearOfManufacture: number;

  @ApiProperty({ example: 'ABC-123' })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiProperty({ example: 'JTDBR32E123456789' })
  @IsString()
  @IsNotEmpty()
  chassisNumber: string;

  @ApiProperty({ enum: TransmissionType, example: TransmissionType.AUTOMATIC })
  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cars/1.jpg' })
  @IsOptional()
  @IsUrl()
  carImageKey?: string;
}
