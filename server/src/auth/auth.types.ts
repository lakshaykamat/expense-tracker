import { IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

const trimString = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export interface JwtPayload {
  sub: string;
  email: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @trimString()
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class RegisterDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @trimString()
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class RefreshTokenDto {
  @IsString({ message: 'Refresh token must be a string' })
  @trimString()
  refresh_token: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
  };
}
