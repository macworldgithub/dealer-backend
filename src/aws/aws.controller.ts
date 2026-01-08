// src/aws/aws.controller.ts

import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from './aws.service';

@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

 
 
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    //@ts-ignore
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const { buffer, originalname, mimetype } = file;

    const folderName = folder?.trim() || 'uploads';

    const key = await this.awsService.uploadFile(
      buffer,
      originalname,
      folderName,
      mimetype,
    );

    const signedUrl = await this.awsService.getSignedUrl(key);

    return {
      message: 'File uploaded successfully',
      key,
      url: signedUrl,
    };
  }
}
