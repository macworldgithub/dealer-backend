// src/inspection/dto/inspection-by-vehicle-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { InspectionStatus } from './update-inspect-status.dto';
import { UserRole } from 'src/Schema/user.schema';

export class InspectionByVehicleQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Optional: fetch one specific inspection under this vehicle',
    example: '65b8f1d9a8a1f2c3d4e5f999',
  })
  @IsOptional()
  @IsMongoId()
  inspectionId?: string;

  @ApiPropertyOptional({ example: 10, default: 10, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: InspectionStatus,
    example: InspectionStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(InspectionStatus)
  status?: InspectionStatus;

  @ApiPropertyOptional({
    description: 'Filter by inspector userId',
    example: '65b8f1d9a8a1f2c3d4e5f679',
  })
  @IsOptional()
  @IsMongoId()
  inspectedBy?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Filter by inspectorRole snapshot',
  })
  @IsOptional()
  @IsEnum(UserRole)
  inspectorRole?: UserRole;
}
