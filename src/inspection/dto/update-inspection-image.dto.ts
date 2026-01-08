// src/inspection/dto/update-inspection-image.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateDamageDto } from './create-damage.dto';

export class UpdateInspectionImageDto {
  @ApiPropertyOptional({ example: 'inspections/analysed/uuid-front-left.jpg' })
  @IsOptional()
  @IsString()
  analysedImageKey?: string;

  @ApiPropertyOptional({ description: 'Raw AI response JSON', type: Object })
  @IsOptional()
  @IsObject()
  aiRaw?: any;

  @ApiPropertyOptional({
    description: 'Replace damages array for this image',
    type: [CreateDamageDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDamageDto)
  damages?: CreateDamageDto[];
}
