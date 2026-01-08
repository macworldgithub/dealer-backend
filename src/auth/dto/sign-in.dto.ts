// src/auth/dto/sign-in.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'admin@dealerinspect.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@12345', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
