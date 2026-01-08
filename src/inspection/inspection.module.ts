// src/inspection/inspection.module.ts (make sure controller is registered)
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InspectionService } from './inspection.service';
import { InspectionController } from './inspection.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthModule } from '../auth/auth.module';
import { Inspection, InspectionSchema } from 'src/Schema/inspection.schema';
import { AwsModule } from 'src/aws/aws.module';
import { Vehicle, VehicleSchema } from 'src/Schema/vehicle.schema';
import { AwsController } from 'src/aws/aws.controller';

@Module({
  imports: [
    AuthModule,
    AwsModule,
    MongooseModule.forFeature([
      { name: Inspection.name, schema: InspectionSchema },
      { name: Vehicle.name, schema: VehicleSchema },
    ]),
  ],
  controllers: [InspectionController],
  providers: [InspectionService, RolesGuard],
  exports: [InspectionService],
})
export class InspectionModule {}
