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
        .map((item, index) => {
          if (typeof item === 'object' && item !== null) {
            return `<div style="margin-bottom: 12px; padding: 10px; background: white; border-radius: 4px; border-left: 3px solid #3b82f6;">
              <strong style="color: #64748b; font-size: 12px;">Item ${index + 1}:</strong><br>
              ${this.formatObject(item)}
            </div>`;
          }
          return `<div style="margin-bottom: 8px; padding-left: 15px;">• ${String(item)}</div>`;
        })
        .join('');
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
          typeof val === 'object' && val !== null && !Array.isArray(val)
            ? JSON.stringify(val)
            : val === null || val === undefined
              ? '-'
              : String(val);
        return `<div style="margin-left: 20px; margin-bottom: 5px;"><strong>${label}:</strong> ${formattedVal}</div>`;
      })
      .join('');
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
          <div class="label">${label}</div>
          <div class="value">${formattedValue}</div>
        </div>
      `;
      })
      .join('');

    const filesList =
      files.length > 0
        ? `
      <div class="section">
        <h3 class="section-title">Archivos Adjuntos</h3>
        <div class="files-list">
          ${files
            .map((file) => {
              const category = file.category || 'unknown';
              const originalName = file.name || 'document';
              return `
            <div class="file-item">
              <span class="category-badge">${category}</span>
              <span class="filename">${originalName}</span>
            </div>
          `;
            })
            .join('')}
        </div>
      </div>
    `
        : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 650px; 
          margin: 0 auto; 
          background-color: #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content { 
          padding: 30px; 
          background: #ffffff;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }
        .field { 
          margin-bottom: 20px; 
          padding: 15px;
          background-color: #f8fafc;
          border-left: 4px solid #3b82f6;
          border-radius: 4px;
        }
        .label { 
          font-weight: 600; 
          color: #475569; 
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .value { 
          color: #1e293b; 
          font-size: 15px;
          line-height: 1.6;
          word-wrap: break-word;
        }
        .files-list { 
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .file-item { 
          padding: 12px 15px; 
          background: white; 
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .category-badge { 
          font-weight: 600; 
          color: white;
          background-color: #1e293b;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          text-transform: uppercase;
        }
        .filename { 
          color: #334155; 
          font-size: 14px;
        }
        .footer {
          background-color: #f8fafc;
          padding: 20px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Nueva Solicitud de Apertura de Cuenta - PERC</h1>
        </div>
        <div class="content">
          <div class="section">
            <h2 class="section-title">Información del Formulario</h2>
            ${fields}
          </div>
          ${filesList}
        </div>
        <div class="footer">
          <p>Si usted esta viendo esto es porque el formulario fue enviado correctamente. Este email fue generado automáticamente por el sistema PERC. No responder a este email.</p>
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
