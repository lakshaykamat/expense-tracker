import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Logger, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto, RegisterDto } from './auth.types';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoggedInUser } from '../common/decorators/loggedin-user.decorator';
import type { UserDocument } from './schemas/user.schema';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) { }

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
  async getUser(@LoggedInUser() user: UserDocument) {
    return this.authService.getLoggedInUser(user)
  }
}