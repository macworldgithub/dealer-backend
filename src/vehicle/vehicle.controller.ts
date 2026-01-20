// src/vehicle/vehicle.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from 'src/Schema/user.schema';
import { VehicleQueryDto } from './dto/vehicle-query.dto';
import { PresignedFileDto } from 'src/common/dto/presigned-file.dto';

@ApiTags('Vehicle')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing/invalid JWT token' })
@UseGuards(JwtAuthGuard, RolesGuard) // ✅ both guards
@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  @ApiOperation({
    summary: 'List vehicles (search + pagination), latest first by createdAt',
  })
  @ApiOkResponse({ description: 'Vehicles fetched successfully' })
  findAll(@Query() query: VehicleQueryDto) {
    return this.vehicleService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single vehicle by ID' })
  @ApiOkResponse({ description: 'Vehicle fetched successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  async findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create vehicle (all roles allowed)' })
  @Roles(
    UserRole.ADMIN,
    UserRole.SERVICE_ADVISOR,
    UserRole.SALES_INVENTORY_MANAGER,
    UserRole.PORTER_DETAILER,
  )
  create(@Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle (porter/detailer not allowed)' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  @Roles(
    UserRole.ADMIN,
    UserRole.SERVICE_ADVISOR,
    UserRole.SALES_INVENTORY_MANAGER,
  )
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicleService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete vehicle (admin only)' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.vehicleService.delete(id);
  }

  @Post('presigned/car-image')
  @ApiOperation({
    summary: 'User: Get presigned URL for vehicle car image upload',
  })
  @ApiOkResponse({ description: 'Presigned URL generated' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  @Roles(
    UserRole.ADMIN,
    UserRole.SERVICE_ADVISOR,
    UserRole.SALES_INVENTORY_MANAGER,
    UserRole.PORTER_DETAILER,
  )
  presignedVehicleCarImage(@Body() dto: PresignedFileDto) {
    return this.vehicleService.getVehicleCarImagePresigned(dto.fileType);
  }
}
