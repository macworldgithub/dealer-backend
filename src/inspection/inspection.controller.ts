// src/inspection/inspection.controller.ts
import {
  Body,
  Controller,
  Param,
  Patch,
  UseGuards,
  Post,
  Req,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorators';
import { UserRole } from 'src/Schema/user.schema';

import { InspectionService } from './inspection.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateInspectionStatusDto } from './dto/update-inspect-status.dto';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { AddInspectionImageDto } from './dto/add-inspect-image.dto';
import { UpdateInspectionImageDto } from './dto/update-inspection-image.dto';
import { UpdateDamageDto } from './dto/update-damage.dto';
import { PresignedFileDto } from 'src/common/dto/presigned-file.dto';
import { AiKeyGuard } from 'src/auth/guards/ai-key.guard';
import { InspectionByVehicleQueryDto } from './dto/inspection-by-vehicle-query.dto';

type AuthedReq = Request & {
  user?: { userId: string; role: UserRole; email?: string };
};

@ApiTags('Inspection')
@Controller('inspection')
export class InspectionController {
  constructor(private readonly inspectionService: InspectionService) {}

  @Get('vehicle/:vehicleId')
  @ApiOperation({
    summary:
      'Get inspections by vehicleId (populate vehicle + user, add signed URLs)',
  })
  @ApiOkResponse({ description: 'Inspections fetched successfully' })
  @ApiParam({ name: 'vehicleId', example: '696010fcfac0e2d2165fa5bf' })
  // @Roles(
  //   UserRole.ADMIN,
  //   UserRole.SERVICE_ADVISOR,
  //   UserRole.SALES_INVENTORY_MANAGER,
  //   UserRole.PORTER_DETAILER,
  // )
  findByVehicleIdPaged(
    @Param('vehicleId') vehicleId: string,
    @Query() query: InspectionByVehicleQueryDto,
  ) {
    return this.inspectionService.findByVehicleIdPaged(vehicleId, query);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT token' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create inspection (can include images + damages)' })
  @ApiCreatedResponse({ description: 'Inspection created successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  @Roles(
    UserRole.ADMIN,
    UserRole.SERVICE_ADVISOR,
    UserRole.SALES_INVENTORY_MANAGER,
    UserRole.PORTER_DETAILER,
  )
  create(@Req() req: AuthedReq, @Body() dto: CreateInspectionDto) {
    return this.inspectionService.createInspection(
      dto,
      req.user!.userId,
      req.user!.role,
    );
  }

  @Post(':id/images')
  @ApiBearerAuth('access-token')
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT token' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Add image to inspection (originalImageKey)' })
  @ApiOkResponse({ description: 'Image added successfully' })
  @ApiNotFoundResponse({ description: 'Inspection not found' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  @Roles(
    UserRole.ADMIN,
    UserRole.SERVICE_ADVISOR,
    UserRole.SALES_INVENTORY_MANAGER,
    UserRole.PORTER_DETAILER,
  )
  addImage(
    @Param('id') inspectionId: string,
    @Body() dto: AddInspectionImageDto,
  ) {
    return this.inspectionService.addImage(inspectionId, {
      originalImageKey: dto.originalImageKey,
    });
  }

  @Patch(':id/images/:imageId')
  @ApiBearerAuth('access-token')
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT token' })
  @UseGuards(JwtAuthGuard)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Update an inspection image (analysedImageKey, aiRaw, damages)',
  })
  @ApiOkResponse({ description: 'Image updated successfully' })
  @ApiNotFoundResponse({ description: 'Inspection or image not found' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  // @Roles(
  //   UserRole.ADMIN,
  //   UserRole.SERVICE_ADVISOR,
  //   UserRole.SALES_INVENTORY_MANAGER,
  // )
  updateImage(
    @Param('id') inspectionId: string,
    @Param('imageId') imageId: string,
    @Body() dto: UpdateInspectionImageDto,
  ) {
    return this.inspectionService.updateImage(inspectionId, imageId, dto);
  }

  @Patch(':id/images/:imageId/damages/:damageId')
  @ApiBearerAuth('access-token')
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT token' })
  @UseGuards(JwtAuthGuard)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update a single damage inside an image' })
  @ApiOkResponse({ description: 'Damage updated successfully' })
  @ApiNotFoundResponse({ description: 'Inspection/image/damage not found' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  // @Roles(
  //   UserRole.ADMIN,
  //   UserRole.SERVICE_ADVISOR,
  //   UserRole.SALES_INVENTORY_MANAGER,
  // )
  updateDamage(
    @Param('id') inspectionId: string,
    @Param('imageId') imageId: string,
    @Param('damageId') damageId: string,
    @Body() dto: UpdateDamageDto,
  ) {
    return this.inspectionService.updateDamage(
      inspectionId,
      imageId,
      damageId,
      dto,
    );
  }

  @Patch(':id/status')
  @ApiBearerAuth('access-token')
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT token' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Change inspection status' })
  @ApiOkResponse({ description: 'Inspection status updated successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  @Roles(
    UserRole.ADMIN,
    UserRole.SERVICE_ADVISOR,
    UserRole.SALES_INVENTORY_MANAGER,
  )
  changeStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInspectionStatusDto,
  ) {
    return this.inspectionService.changeStatus(id, dto.status);
  }

  // DELETE INSPECTION (Admin only)
  // -------------------------
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT token' })
  @UseGuards(JwtAuthGuard)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Delete inspection (deletes S3 images + unlinks from vehicle)',
  })
  @ApiOkResponse({ description: 'Inspection deleted successfully' })
  @ApiNotFoundResponse({ description: 'Inspection not found' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  // @Roles(UserRole.ADMIN)
  remove(@Param('id') inspectionId: string) {
    return this.inspectionService.deleteInspection(inspectionId);
  }

  // USER: original image presigned
  @Post('presigned/original')
  @ApiBearerAuth('access-token')
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT token' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT token' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'User: Get presigned URL for inspection ORIGINAL image upload',
  })
  @ApiOkResponse({ description: 'Presigned URL generated' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  @Roles(
    UserRole.ADMIN,
    UserRole.SERVICE_ADVISOR,
    UserRole.SALES_INVENTORY_MANAGER,
    UserRole.PORTER_DETAILER,
  )
  presignedOriginal(@Body() dto: PresignedFileDto) {
    return this.inspectionService.getInspectionOriginalPresigned(dto.fileType);
  }

  // AI: analysed image presigned (server-to-server)
  @Post('presigned/analysed-ai')
  @UseGuards(AiKeyGuard)
  @ApiHeader({
    name: 'x-ai-key',
    description: 'AI service key (server-to-server)',
  })
  @ApiOperation({
    summary: 'AI: Get presigned URL for inspection ANALYSED image upload',
  })
  @ApiOkResponse({ description: 'Presigned URL generated' })
  presignedAnalysedAi(@Body() dto: PresignedFileDto) {
    return this.inspectionService.getInspectionAnalysedPresigned(dto.fileType);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one inspection by inspectionId (populate + signed URLs)',
  })
  @ApiOkResponse({ description: 'Inspection fetched successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  @ApiParam({ name: 'id', example: '65b8f1d9a8a1f2c3d4e5f999' })
  // @Roles(
  //   UserRole.ADMIN,
  //   UserRole.SERVICE_ADVISOR,
  //   UserRole.SALES_INVENTORY_MANAGER,
  //   UserRole.PORTER_DETAILER,
  // )
  getOne(@Param('id') id: string) {
    return this.inspectionService.findOneWithRefs(id);
  }
}
