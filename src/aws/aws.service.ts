import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AwsService {
  private s3: AWS.S3;
  private readonly bucket: string;

  constructor() {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      credentials: {
        //@ts-ignore
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        //@ts-ignore
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },

      signatureVersion: 'v4',
    });

    //@ts-ignore
    this.bucket = process.env.AWS_BUCKET_NAME;
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    folder: string,
    mimeType: string,
  ): Promise<string> {
    const fileKey = `${folder}/${uuidv4()}-${originalName}`;

    const result = await this.s3
      .upload({
        Bucket: this.bucket,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: mimeType,
      })
      .promise();

    return fileKey;
  }

  async uploadMultipleFiles(
    //@ts-ignore
    files: Express.Multer.File[],
    folder: string,
  ): Promise<string[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file.buffer, file.originalname, folder, file.mimetype),
    );

    return Promise.all(uploadPromises); // array of S3 URLs
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    await this.s3
      .deleteObject({
        Bucket: this.bucket,
        Key: fileKey,
      })
      .promise();

    return true;
  }

  async getSignedUrl(fileKey: string): Promise<string> {
    const params = {
      Bucket: this.bucket,
      Key: fileKey,
      Expires: 60 * 60 * 24 * 7,
    };

    return this.s3.getSignedUrlPromise('getObject', params);
  }

  async getSignedUrls(keys: string[]): Promise<string[]> {
    return Promise.all(keys.map((key) => this.getSignedUrl(key)));
  }

  async generatePresignedUrl(
    fileName: string,
    fileType: string,
    folder?: string,
  ): Promise<{ url: string; key: string }> {
    const key = `${folder ? `${folder}/` : ''}${uuidv4()}-${fileName}`;

    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: 60 * 60 * 12 * 2, // 1 hour
      ContentType: fileType,
    };

    const url = await this.s3.getSignedUrlPromise('putObject', params);
    return { url, key };
  }

  async generateMultiplePresignedUrls(
    files: { fileName: string; fileType: string }[],
  ): Promise<{ urls: { url: string; key: string }[] }> {
    const urls = await Promise.all(
      files.map(({ fileName, fileType }) =>
        this.generatePresignedUrl(fileName, fileType),
      ),
    );
    return { urls };
  }

  async extractKeyFromSignedUrl(signedUrl: string): Promise<string | null> {
    try {
      const url = new URL(signedUrl);
      return decodeURIComponent(url.pathname.slice(1)); // removes leading '/'
    } catch {
      return null;
    }
  }
}
