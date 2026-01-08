// src/inspection/dto/create-repair-cost.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateRepairCostDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 400, minimum: 0 })
  @IsNumber()
  @Min(0)
  min: number;

  @ApiProperty({ example: 800, minimum: 0 })
  @IsNumber()
  @Min(0)
  max: number;
}
