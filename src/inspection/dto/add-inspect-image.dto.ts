// src/inspection/dto/add-inspection-image.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddInspectionImageDto {
  @ApiProperty({ example: 'inspections/original/uuid-front-left.jpg' })
  @IsString()
  @IsNotEmpty()
  originalImageKey: string;
}
