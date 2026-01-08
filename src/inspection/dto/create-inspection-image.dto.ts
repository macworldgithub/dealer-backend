// src/inspection/dto/create-inspection-image.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateDamageDto } from './create-damage.dto';

export class CreateInspectionImageDto {
  @ApiProperty({ example: 'inspections/original/uuid-front-left.jpg' })
  @IsString()
  @IsNotEmpty()
  originalImageKey: string;

  @ApiPropertyOptional({ example: 'inspections/analysed/uuid-front-left.jpg' })
  @IsOptional()
  @IsString()
  analysedImageKey?: string;

  @ApiPropertyOptional({ description: 'Raw AI response JSON', type: Object })
  @IsOptional()
  @IsObject()
  aiRaw?: any;

  @ApiPropertyOptional({
    type: [CreateDamageDto],
    description: 'Damages detected in this image',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDamageDto)
  damages?: CreateDamageDto[];
}
