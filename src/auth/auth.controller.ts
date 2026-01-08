import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';

class SignInResponseDto {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
  };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @ApiOperation({ summary: 'Sign in (email + password)' })
  @ApiOkResponse({ description: 'Signed in successfully', type: SignInResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }
}
