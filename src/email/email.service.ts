import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from '../form/dto/send-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private smtpUser: string;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = parseInt(this.configService.get<string>('SMTP_PORT', '587'), 10);
    this.smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (!smtpHost || !this.smtpUser || !smtpPass) {
      this.logger.error('SMTP configuration incomplete:', {
        host: !!smtpHost,
        user: !!this.smtpUser,
        pass: !!smtpPass,
      });
      throw new Error('SMTP configuration incomplete. Please check SMTP_HOST, SMTP_USER, and SMTP_PASS/SMTP_PASSWORD');
    }

    const smtpConfig: any = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: this.smtpUser,
        pass: smtpPass,
      },
    };

    this.transporter = nodemailer.createTransport(smtpConfig);
  }

  private generateEmailHTML(formData: Record<string, unknown>, files: Array<{ name: string; category: string }>) {
    const fields = Object.entries(formData)
      .map(([key, value]) => {
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
        return `
        <div class="field">
          <span class="label">${label}:</span>
          <span class="value">${value || '-'}</span>
        </div>
      `;
      })
      .join('');

    const filesList =
      files.length > 0
        ? `
      <h2>Archivos Adjuntos</h2>
      <ul class="files-list">
        ${files
          .map((file) => {
            const category = file.category || 'unknown';
            const originalName = file.name || 'document';
            return `
            <li>
              <span class="category">[${category}]</span>
              <span class="filename">${originalName}</span>
            </li>
          `;
          })
          .join('')}
      </ul>
    `
        : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
        .content { background: #f8fafc; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #475569; }
        .value { color: #334155; }
        .files-list { list-style: none; padding: 0; margin-top: 20px; }
        .files-list li { padding: 8px; background: white; margin-bottom: 8px; border-left: 3px solid #1e293b; }
        .category { font-weight: bold; color: #1e293b; margin-right: 10px; }
        .filename { color: #334155; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nuevo Formulario PERC</h1>
        </div>
        <div class="content">
          <h2>Datos del Formulario</h2>
          ${fields}
          ${filesList}
        </div>
      </div>
    </body>
    </html>
  `;
  }

  async sendEmail(dto: SendEmailDto): Promise<unknown> {
    try {
      const recipientEmail =
        this.configService.get<string>('EMAIL_TO') ||
        dto.formData.email;

      const attachments = dto.files.map((file) => {
        const category = file.category || 'unknown';
        const originalName = file.name || 'document';
        const extension = originalName.split('.').pop() || '';
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        const filename = `${category}_${nameWithoutExt}.${extension}`;

        return {
          filename: filename,
          content: Buffer.from(file.buffer, 'base64'),
          contentType: file.mimetype,
        };
      });

      const htmlContent = this.generateEmailHTML(dto.formData, dto.files);

      const mailOptions = {
        from:
          this.configService.get<string>('SMTP_FROM'),
        to: recipientEmail,
        subject: `Nuevo Formulario PERC - ${dto.formData.socialDenomination || 'Sin nombre'}`,
        html: htmlContent,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log('Email sent successfully:', {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      });

      return {
        success: true,
        messageId: info.messageId,
        message: 'Email enviado correctamente',
      };
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error;
    }
  }
}

