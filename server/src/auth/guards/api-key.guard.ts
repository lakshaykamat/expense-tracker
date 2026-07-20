import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['x-api-key'];

    if (!key || typeof key !== 'string') {
      throw new UnauthorizedException('API key required');
    }

    const user = await this.authService.findByApiKey(key);
    if (!user) {
      throw new UnauthorizedException('Invalid API key');
    }

    request.user = { ...user.toObject(), userId: user._id.toString() };
    return true;
  }
}
