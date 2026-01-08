import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { SendOtpDto } from './dto/send-otp.dto';

@Controller('email')
export class MailController {
  constructor(private readonly emailService: MailService) {}

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP email' })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({ status: 201, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async sendOtp(@Body() body: SendOtpDto) {
    await this.emailService.sendOtpEmail(body.email, body.name, body.otp);
    return { success: true, message: 'OTP sent successfully' };
  }
}
