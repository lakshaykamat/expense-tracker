import { Injectable } from '@nestjs/common';

export interface UserProfile {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    lastLoginAt?: Date;
  };
}

@Injectable()
export class UsersService {
  getProfile(user: any): UserProfile {
    return {
      message: 'Profile data',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        lastLoginAt: user.lastLoginAt,
      },
    };
  }
}
