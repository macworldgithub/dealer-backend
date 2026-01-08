import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AwsModule } from './aws/aws.module';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { InspectionModule } from './inspection/inspection.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AwsModule,
    DatabaseModule,
    MailModule,
    UserModule,
    AuthModule,
    VehicleModule,
    InspectionModule,
  
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
