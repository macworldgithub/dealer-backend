import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Recipient email address',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: 'Muhammad Anas',
    description: 'Name of the recipient',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '458213',
    description: 'One-time password code (usually 6 digits)',
  })
  @IsString()
  @Length(4, 8, { message: 'OTP must be between 4 and 8 characters' })
  otp: string;
}
