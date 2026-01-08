// src/inspection/dto/create-inspection.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreateInspectionImageDto } from './create-inspection-image.dto';
import { InspectionStatus } from './update-inspect-status.dto';

export class CreateInspectionDto {
  @ApiProperty({
    example: '65b8f1d9a8a1f2c3d4e5f678',
    description: 'Vehicle _id',
  })
  @IsMongoId()
  vehicleId: string;

  @ApiPropertyOptional({
    enum: InspectionStatus,
    example: InspectionStatus.DRAFT,
    description: 'If not provided, defaults to DRAFT',
  })
  @IsOptional()
  @IsEnum(InspectionStatus)
  status?: InspectionStatus;

  @ApiPropertyOptional({
    type: [CreateInspectionImageDto],
    description: 'Create inspection with multiple images and damages',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInspectionImageDto)
  images?: CreateInspectionImageDto[];
}
