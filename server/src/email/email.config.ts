import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export function createEmailTransporter(
  configService: ConfigService,
): nodemailer.Transporter {
  const port = configService.get<number>('SMTP_PORT', 587);
  const secure = configService.get<boolean>('SMTP_SECURE', false);
  const host = configService.get<string>('SMTP_HOST', 'smtp.gmail.com');

  const smtpUser = configService.get<string>('SMTP_USER');
  const smtpPass = configService.get<string>('SMTP_PASS');

  if (!smtpUser || !smtpPass) {
    throw new Error(
      'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.',
    );
  }

  const transportOptions: any = {
    host,
    port,
    secure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  };

  if (port === 587 && !secure) {
    transportOptions.requireTLS = true;
    transportOptions.tls = {
      rejectUnauthorized: false,
    };
  } else if (secure) {
    transportOptions.tls = {
      rejectUnauthorized: false,
    };
  }

  return nodemailer.createTransport(transportOptions);
}
