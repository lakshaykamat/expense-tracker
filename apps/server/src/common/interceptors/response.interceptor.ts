import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // If the response already has the expected format, return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Handle auth responses that have message but no data wrapper
        if (data && typeof data === 'object' && 'message' in data && !('data' in data)) {
          return {
            success: true,
            statusCode: response.statusCode || 200,
            message: data.message,
            data: data.user || data,
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        // Handle standard responses
        return {
          success: true,
          statusCode: response.statusCode || 200,
          message: this.getDefaultMessage(request.method, request.url),
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }

  private getDefaultMessage(method: string, url: string): string {
    if (url.includes('/auth')) {
      if (method === 'POST' && url.includes('/register')) return 'Registration successful';
      if (method === 'POST' && url.includes('/login')) return 'Login successful';
      if (method === 'POST' && url.includes('/logout')) return 'Logout successful';
    }
    
    switch (method) {
      case 'GET':
        return 'Resource retrieved successfully';
      case 'POST':
        return 'Resource created successfully';
      case 'PUT':
      case 'PATCH':
        return 'Resource updated successfully';
      case 'DELETE':
        return 'Resource deleted successfully';
      default:
        return 'Operation successful';
    }
  }
}
