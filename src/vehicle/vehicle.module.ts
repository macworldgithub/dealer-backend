// src/vehicle/vehicle.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';


import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';

// guards
import { RolesGuard } from '../auth/guards/roles.guard';

// (Recommended) import AuthModule so JwtStrategy is registered and JWT works everywhere
import { AuthModule } from '../auth/auth.module';
import { Vehicle, VehicleSchema } from 'src/Schema/vehicle.schema';
import { AwsModule } from 'src/aws/aws.module';
import { AwsController } from 'src/aws/aws.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }]),
    AwsModule
  ],
  controllers: [VehicleController],
  providers: [VehicleService, RolesGuard,AwsController],
  exports: [VehicleService],
})
export class VehicleModule {}
