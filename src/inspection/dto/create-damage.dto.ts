// src/inspection/dto/create-damage.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import { CreateRepairCostDto } from './create-repair-cost.dto';

export class CreateDamageDto {
  @ApiProperty({ example: 'dent' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'moderate' })
  @IsString()
  severity: string;

  @ApiProperty({ example: 1.0, minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @ApiProperty({
    example: [0.1, 0.1, 0.8, 0.5],
    description: 'Normalized bbox [x1, y1, x2, y2]',
    type: [Number],
  })
  @IsArray()
  bbox: number[];

  @ApiPropertyOptional({ example: 'Moderate dent on front left fender...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: CreateRepairCostDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRepairCostDto)
  repair_cost_estimate?: CreateRepairCostDto;
}
