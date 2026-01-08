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

type AuthedReq = Request & {
  user?: { userId: string; role: UserRole; email?: string };
};

@ApiTags('Inspection')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing/invalid JWT token' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inspection')
export class InspectionController {
  constructor(private readonly inspectionService: InspectionService) {}

  @Post()
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
  @ApiOperation({
    summary: 'Update an inspection image (analysedImageKey, aiRaw, damages)',
  })
  @ApiOkResponse({ description: 'Image updated successfully' })
  @ApiNotFoundResponse({ description: 'Inspection or image not found' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  @Roles(
    UserRole.ADMIN,
    UserRole.SERVICE_ADVISOR,
    UserRole.SALES_INVENTORY_MANAGER,
  )
  updateImage(
    @Param('id') inspectionId: string,
    @Param('imageId') imageId: string,
    @Body() dto: UpdateInspectionImageDto,
  ) {
    return this.inspectionService.updateImage(inspectionId, imageId, dto);
  }

  @Patch(':id/images/:imageId/damages/:damageId')
  @ApiOperation({ summary: 'Update a single damage inside an image' })
  @ApiOkResponse({ description: 'Damage updated successfully' })
  @ApiNotFoundResponse({ description: 'Inspection/image/damage not found' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  @Roles(
    UserRole.ADMIN,
    UserRole.SERVICE_ADVISOR,
    UserRole.SALES_INVENTORY_MANAGER,
  )
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
  @ApiOperation({
    summary: 'Delete inspection (deletes S3 images + unlinks from vehicle)',
  })
  @ApiOkResponse({ description: 'Inspection deleted successfully' })
  @ApiNotFoundResponse({ description: 'Inspection not found' })
  @ApiForbiddenResponse({ description: 'Insufficient role permissions' })
  @Roles(UserRole.ADMIN)
  remove(@Param('id') inspectionId: string) {
    return this.inspectionService.deleteInspection(inspectionId);
  }
}
