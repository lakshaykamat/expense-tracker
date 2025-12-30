import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Logger, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto, RegisterDto } from './auth.types';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserDocument } from './schemas/user.schema';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: UserDocument) {
    return {
      id: user._id.toString(),
      email: user.email,
      createdAt: (user as any).createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}