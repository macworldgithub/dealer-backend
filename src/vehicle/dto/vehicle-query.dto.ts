// src/vehicle/dto/vehicle-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TransmissionType } from '../enum/tranmission-type';

export class VehicleQueryDto {
  @ApiPropertyOptional({
    description:
      'Flexible search across make/model/variant/registrationNumber/chassisNumber',
    example: 'corolla',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Toyota' })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ example: 'Corolla' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 'GLi' })
  @IsOptional()
  @IsString()
  variant?: string;

  @ApiPropertyOptional({ example: 'ABC-123' })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiPropertyOptional({ example: 'JTDBR32E123456789' })
  @IsOptional()
  @IsString()
  chassisNumber?: string;

  @ApiPropertyOptional({
    enum: TransmissionType,
    example: TransmissionType.AUTOMATIC,
  })
  @IsOptional()
  @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  @ApiPropertyOptional({ example: 2021 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearOfManufacture?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
