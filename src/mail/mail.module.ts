import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { MailService } from './mail.service';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailController } from './mail.controller';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
        auth: {
          user: process.env.SMTP_SUPPORT_USER,
          pass: process.env.SMTP_SUPPORT_PASS,
        },
      },
      defaults: {
        from: `"Omnisuite AI Support" <${process.env.SMTP_SUPPORT_USER}>`,
      },
      template: {
        dir: join(__dirname, '..', '..', 'views'), // Root-level views folder
        adapter: new EjsAdapter(),
        options: {
          strict: false,
        },
      },
    }),

    MongooseModule.forFeature([]),
  ],
  providers: [MailService],
  exports: [MailService],
  // controllers: [MailController],
})
export class MailModule {}
