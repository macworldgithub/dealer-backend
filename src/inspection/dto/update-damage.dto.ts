// src/inspection/dto/update-damage.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class UpdateRepairCostDto {
  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 100, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  min?: number;

  @ApiPropertyOptional({ example: 300, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max?: number;
}

export class UpdateDamageDto {
  @ApiPropertyOptional({ example: 'dent' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'moderate' })
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiPropertyOptional({ example: 0.9, minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @ApiPropertyOptional({
    example: [0.1, 0.1, 0.8, 0.5],
    description: 'Normalized bbox [x1, y1, x2, y2]',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  bbox?: number[];

  @ApiPropertyOptional({ example: 'Updated description...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: UpdateRepairCostDto,
    example: { currency: 'USD', min: 400, max: 800 },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateRepairCostDto)
  repair_cost_estimate?: UpdateRepairCostDto;
}
