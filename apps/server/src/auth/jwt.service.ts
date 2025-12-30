import jwt from 'jsonwebtoken';
import { Injectable, Logger } from '@nestjs/common';
import { JwtPayload } from './auth.types';

@Injectable()
export class JwtService {
    private readonly logger = new Logger(JwtService.name);
    private readonly accessSecret: string;
    private readonly refreshSecret: string;

    constructor() {
        this.accessSecret = process.env.JWT_ACCESS_SECRET || 'fallback-access-secret';
        this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
        
        if (!process.env.JWT_ACCESS_SECRET) {
            this.logger.warn('JWT_ACCESS_SECRET not found in environment variables, using fallback');
        }
        if (!process.env.JWT_REFRESH_SECRET) {
            this.logger.warn('JWT_REFRESH_SECRET not found in environment variables, using fallback');
        }
    }

    signAccess(payload: JwtPayload) {
        try {
            return jwt.sign(payload, this.accessSecret, {
                expiresIn: "2h"  // 2 hours for better UX
            })
        } catch (error) {
            this.logger.error('Failed to sign access token', error);
            throw new Error('Token signing failed');
        }
    }

    signRefresh(payload: JwtPayload) {
        try {
            return jwt.sign(payload, this.refreshSecret, {
                expiresIn: "7d"
            })
        } catch (error) {
            this.logger.error('Failed to sign refresh token', error);
            throw new Error('Token signing failed');
        }
    }

    verifyAccess(token: string) {
        try {
            return jwt.verify(token, this.accessSecret) as JwtPayload
        } catch (error) {
            this.logger.error('Failed to verify access token', error);
            throw new Error('Token verification failed');
        }
    }

    verifyRefresh(token: string): JwtPayload {
        try {
            return jwt.verify(token, this.refreshSecret) as JwtPayload;
        } catch (error) {
            this.logger.error('Failed to verify refresh token', error);
            throw new Error('Token verification failed');
        }
    }
}
