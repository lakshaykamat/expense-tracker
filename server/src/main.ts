import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parse multiple frontend URLs from comma-separated string
  const getCorsOrigins = (): string[] | string => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // If comma-separated, split and trim each URL
    if (frontendUrl.includes(',')) {
      return frontendUrl
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0);
    }
    
    return frontendUrl;
  };

  app.enableCors({
    origin: getCorsOrigins(),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: false,
    transform: false,
  }));

  // Add global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  // Add global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();