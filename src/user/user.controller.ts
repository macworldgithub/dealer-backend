// src/user/user.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a user (with role)' })
  @ApiCreatedResponse({ description: 'User created successfully', type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error / invalid role' })
  @ApiConflictResponse({ description: 'Email or phoneNumber already exists' })
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.createUser(dto);
  }
}
