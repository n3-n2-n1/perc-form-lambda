import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { SendEmailDto } from '../form/dto/send-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sendgridApiKey) {
      sgMail.setApiKey(sendgridApiKey);
    }
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'SI' : 'NO';
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '-';
      }
      return value
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            return this.formatObject(item);
          }
          return String(item);
        })
        .join('<br>');
    }
    if (typeof value === 'object') {
      return this.formatObject(value as Record<string, unknown>);
    }
    return String(value);
  }

  private formatObject(obj: Record<string, unknown>): string {
    const entries = Object.entries(obj)
      .map(([key, val]) => {
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
        const formattedVal =
          typeof val === 'object' && val !== null
            ? JSON.stringify(val)
            : val === null || val === undefined
              ? '-'
              : String(val);
        return `${label}: ${formattedVal}`;
      })
      .join(', ');
    return entries || '-';
  }

  private generateEmailHTML(formData: Record<string, unknown>, files: Array<{ name: string; category: string }>) {
    const fields = Object.entries(formData)
      .map(([key, value]) => {
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
        const formattedValue = this.formatValue(value);
        return `
        <div class="field">
          <span class="label">${label}:</span>
          <span class="value">${formattedValue}</span>
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
      const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
      if (!sendgridApiKey) {
        throw new Error('SENDGRID_API_KEY is required for email fallback');
      }

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
          content: file.buffer,
          filename: filename,
          type: file.mimetype,
          disposition: 'attachment',
        };
      });

      const htmlContent = this.generateEmailHTML(dto.formData, dto.files);

      const msg = {
        to: recipientEmail,
        from: this.configService.get<string>('SMTP_FROM') || 'noreply@perc.com',
        subject: `Nuevo Formulario PERC - ${dto.formData.socialDenomination || 'Sin nombre'}`,
        html: htmlContent,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const [response] = await sgMail.send(msg);

      this.logger.log('Email sent successfully via SendGrid:', {
        statusCode: response.statusCode,
        headers: response.headers,
      });

      return {
        success: true,
        messageId: response.headers['x-message-id'] || 'unknown',
        message: 'Email enviado correctamente',
      };
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error;
    }
  }
}
