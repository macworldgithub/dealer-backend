// src/aws/dto/get-signed-url.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetSignedUrlDto {
  @ApiProperty({ example: 'vehicles/car-images/uuid-car-image.jpg' })
  @IsString()
  @IsNotEmpty()
  key: string;
}
