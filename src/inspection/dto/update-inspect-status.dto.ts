// src/inspection/dto/update-inspection-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum InspectionStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  SENT = 'SENT',
}

export class UpdateInspectionStatusDto {
  @ApiProperty({ enum: InspectionStatus, example: InspectionStatus.COMPLETED })
  @IsEnum(InspectionStatus)
  status: InspectionStatus;
}
