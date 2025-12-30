import { Injectable, ConflictException, UnauthorizedException, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "./jwt.service";
import type { LoginDto, RegisterDto, AuthResponse, RefreshTokenDto } from "./auth.types";
import { User, UserDocument } from "./schemas/user.schema";

export interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserModel = Model<UserDocument, {}, UserMethods>;

export interface AuthResult {
  message: string;
  user: {
    id: string;
    email: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwt: JwtService,
    @InjectModel(User.name) private readonly userModel: UserModel
  ) { }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      this.logger.log(`Registering user with email: ${registerDto.email}`);

      const existingUser = await this.userModel.findOne({ email: registerDto.email });
      if (existingUser) {
        this.logger.warn(`Registration failed: Email ${registerDto.email} already exists`);
        throw new ConflictException('User with this email already exists');
      }

      const user = new this.userModel({
        email: registerDto.email,
        password: registerDto.password,
      });

      this.logger.log(`Creating user with email: ${registerDto.email}`);

      await user.save();
      this.logger.log(`User created successfully with ID: ${user._id}`);

      const access_token = this.jwt.signAccess({ sub: user._id.toString(), email: user.email });
      const refresh_token = this.jwt.signRefresh({ sub: user._id.toString(), email: user.email });

      const authResponse: AuthResponse = {
        access_token,
        refresh_token,
        user: {
          id: user._id.toString(),
          email: user.email,
        }
      };

      return authResponse;
    } catch (error) {
      this.logger.error('Registration failed', error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userModel.findOne({ email: loginDto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const access_token = this.jwt.signAccess({ sub: user._id.toString(), email: user.email });
    const refresh_token = this.jwt.signRefresh({ sub: user._id.toString(), email: user.email });

    const authResponse: AuthResponse = {
      access_token,
      refresh_token,
      user: {
        id: user._id.toString(),
        email: user.email,
      }
    };

    return authResponse;
  }

  async getLoggedInUser(user: UserDocument) {
    return {
      id: user._id.toString(),
      email: user.email,
      createdAt: (user as any).createdAt,
      lastLoginAt: user.lastLoginAt,
    }

  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      const payload = this.jwt.verifyRefresh(refreshTokenDto.refresh_token);
      const user = await this.validateUser(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const access_token = this.jwt.signAccess({ sub: user._id.toString(), email: user.email });
      const refresh_token = this.jwt.signRefresh({ sub: user._id.toString(), email: user.email });

      return {
        access_token,
        refresh_token,
        user: {
          id: user._id.toString(),
          email: user.email,
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUser(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId);
  }

  verifyAccess(token: string) {
    return this.jwt.verifyAccess(token);
  }
}