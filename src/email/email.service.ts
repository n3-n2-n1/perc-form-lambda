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

  private translateLabel(key: string): string {
    const translations: Record<string, string> = {
      // Datos básicos
      socialDenomination: 'Denominación Social',
      cuitNumber: 'Número de CUIT',
      societyType: 'Tipo de Sociedad',
      order: 'Orden',
      sector: 'Sector',
      activityType: 'Tipo de Actividad',
      activityStartDate: 'Fecha de Inicio de Actividad',
      countryOfInscription: 'País de Inscripción',
      inscriptIn: 'Inscripto en',
      inscriptionNumber: 'Número de Inscripción',
      email: 'Correo Electrónico',
      phone: 'Teléfono',
      address: 'Dirección',
      city: 'Ciudad',
      province: 'Provincia',
      postalCode: 'Código Postal',
      clientIp: 'IP del Cliente',
      
      // Direcciones
      legalAddress: 'Dirección Legal',
      realAddress: 'Dirección Real',
      street: 'Calle',
      
      // Fiscalidad
      subjectObliged: 'Sujeto Obligado',
      fiscalResidenceArgentina: 'Residencia Fiscal Argentina',
      fiscalResidenceCountry: 'País de Residencia Fiscal',
      fiscalResidenceAddress: 'Dirección de Residencia Fiscal',
      
      // Beneficiarios y Directores
      finalBeneficiaries: 'Beneficiarios Finales',
      directors: 'Directores',
      name: 'Nombre',
      document: 'Documento',
      percentage: 'Porcentaje',
      position: 'Cargo',
      
      // Otros campos comunes
      acceptTerms: 'Acepta Términos',
      comments: 'Comentarios',
      additionalInfo: 'Información Adicional',
    };
    
    // Buscar coincidencia exacta primero (camelCase)
    if (translations[key]) {
      return translations[key];
    }
    
    // Si la clave tiene espacios, convertir a camelCase y buscar
    if (key.includes(' ')) {
      const camelCaseKey = key
        .trim()
        .split(/\s+/)
        .map((word, index) => {
          if (index === 0) {
            return word.toLowerCase();
          }
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('');
      
      if (translations[camelCaseKey]) {
        return translations[camelCaseKey];
      }
    }
    
    // Buscar coincidencia insensible a mayúsculas/minúsculas
    const foundKey = Object.keys(translations).find(
      (k) => k.toLowerCase() === key.toLowerCase() || 
             k.toLowerCase() === key.toLowerCase().replace(/\s+/g, '')
    );
    
    if (foundKey) {
      return translations[foundKey];
    }
    
    // Si no hay traducción, convertir camelCase a formato legible en español
    // Pero esto no debería pasar si todas las claves están en el diccionario
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  private translateCategory(category: string): string {
    const translations: Record<string, string> = {
      balance: 'Balance',
      statute: 'Estatuto',
      designAuthorities: 'Designación de Autoridades',
      dniFront: 'DNI Frente',
      dniBack: 'DNI Dorso',
      unknown: 'Desconocido',
    };
    
    return translations[category] || category;
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '<span style="color: #94a3b8; font-style: italic;">No especificado</span>';
    }
    if (typeof value === 'boolean') {
      const badgeColor = value ? '#10b981' : '#ef4444';
      const badgeText = value ? 'SI' : 'NO';
      return `<span style="display: inline-block; padding: 4px 10px; background-color: ${badgeColor}; color: #ffffff; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${badgeText}</span>`;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '<span style="color: #94a3b8; font-style: italic;">No especificado</span>';
      }
      return value
        .map((item, index) => {
          if (typeof item === 'object' && item !== null) {
            return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px; border-collapse: separate;">
              <tr>
                <td style="padding: 16px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; border-left: 4px solid #3b82f6;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding: 0 0 12px 0; border-bottom: 1px solid #f1f5f9;">
                        <p style="margin: 0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Registro ${index + 1}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0 0 0;">
                        ${this.formatObject(item)}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>`;
          }
          return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
            <tr>
              <td style="padding: 0;">
                <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.8;">
                  <span style="display: inline-block; width: 6px; height: 6px; background-color: #3b82f6; border-radius: 50%; margin-right: 10px; vertical-align: middle;"></span>
                  ${String(item)}
                </p>
              </td>
            </tr>
          </table>`;
        })
        .join('');
    }
    if (typeof value === 'object') {
      return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; border-left: 4px solid #8b5cf6;">
        <tr>
          <td style="padding: 16px;">
            ${this.formatObject(value as Record<string, unknown>)}
          </td>
        </tr>
      </table>`;
    }
    return String(value);
  }

  private formatObject(obj: Record<string, unknown>): string {
    const entries = Object.entries(obj)
      .map(([key, val]) => {
        const label = this.translateLabel(key);
        let formattedVal: string;
        
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          formattedVal = this.formatObject(val as Record<string, unknown>);
        } else if (val === null || val === undefined) {
          formattedVal = '<span style="color: #94a3b8; font-style: italic;">No especificado</span>';
        } else if (typeof val === 'boolean') {
          const badgeColor = val ? '#10b981' : '#ef4444';
          const badgeText = val ? 'SI' : 'NO';
          formattedVal = `<span style="display: inline-block; padding: 3px 8px; background-color: ${badgeColor}; color: #ffffff; border-radius: 10px; font-size: 11px; font-weight: 600; text-transform: uppercase;">${badgeText}</span>`;
        } else {
          formattedVal = String(val);
        }
        
        return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
          <tr>
            <td style="padding: 0;">
              <p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;">${label}</p>
              <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.7;">${formattedVal}</p>
            </td>
          </tr>
        </table>`;
      })
      .join('');
    return entries || '<span style="color: #94a3b8; font-style: italic;">No especificado</span>';
  }

  private generateEmailHTML(formData: Record<string, unknown>, files: Array<{ name: string; category: string }>) {
    const fields = Object.entries(formData)
      .map(([key, value]) => {
        const label = this.translateLabel(key);
        const formattedValue = this.formatValue(value);
        return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; border-collapse: separate;">
          <tr>
            <td style="padding: 20px; background: linear-gradient(to right, #f8fafc 0%, #ffffff 100%); border-left: 4px solid #3b82f6; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-weight: 700; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px;">${label}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0 0 0;">
                    <div style="color: #1e293b; font-size: 15px; line-height: 1.8; word-wrap: break-word;">
                      ${formattedValue}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
      })
      .join('');

    const filesList =
      files.length > 0
        ? `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 40px;">
          <tr>
            <td style="padding: 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 0 0 16px 0; border-bottom: 2px solid #e2e8f0;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #1e293b; letter-spacing: -0.3px;">Archivos Adjuntos</h2>
                    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px; font-weight: 400;">${files.length} ${files.length === 1 ? 'archivo adjunto' : 'archivos adjuntos'}</p>
                  </td>
                </tr>
              </table>
              ${files
                .map((file) => {
                  const category = file.category || 'unknown';
                  const originalName = file.name || 'document';
                  const translatedCategory = this.translateCategory(category);
                  const categoryColors: Record<string, string> = {
                    balance: '#3b82f6',
                    statute: '#8b5cf6',
                    designAuthorities: '#10b981',
                    dniFront: '#f59e0b',
                    dniBack: '#f59e0b',
                    unknown: '#64748b',
                  };
                  const categoryColor = categoryColors[category] || categoryColors.unknown;
                  return `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px; border-collapse: separate;">
                  <tr>
                    <td style="padding: 16px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; border-left: 4px solid ${categoryColor}; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding-right: 12px; vertical-align: middle;">
                            <span style="display: inline-block; font-weight: 700; color: #ffffff; background-color: ${categoryColor}; padding: 6px 14px; border-radius: 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${translatedCategory}</span>
                          </td>
                          <td style="color: #334155; font-size: 14px; vertical-align: middle; font-weight: 500;">
                            ${originalName}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              `;
                })
                .join('')}
            </td>
          </tr>
        </table>
    `
        : '';

    return `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
<!--[if gte mso 9]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <!--[if mso]>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <![endif]-->
  <title>Nueva Solicitud PERC</title>
  <style type="text/css">
    @media only screen and (min-width: 670px) {
      .u-row {
        width: 650px !important;
      }
      .u-row .u-col {
        vertical-align: top;
      }
      .u-row .u-col-100 {
        width: 650px !important;
      }
    }
    @media (max-width: 670px) {
      .u-row-container {
        max-width: 100% !important;
        padding-left: 0px !important;
        padding-right: 0px !important;
      }
      .u-row {
        width: calc(100% - 40px) !important;
      }
      .u-row .u-col {
        min-width: 320px !important;
        max-width: 100% !important;
        display: block !important;
      }
      .u-col {
        width: 100% !important;
      }
      .u-col > div {
        margin: 0 auto;
      }
    }
    body {
      margin: 0;
      padding: 0;
    }
    table,
    tr,
    td {
      vertical-align: top;
      border-collapse: collapse;
    }
    p {
      margin: 0;
    }
    * {
      line-height: inherit;
    }
    a[x-apple-data-detectors='true'] {
      color: inherit !important;
      text-decoration: none !important;
    }
    table,
    td {
      color: #1e293b;
    }
    @media (max-width: 480px) {
      .v-container-padding-padding {
        padding: 15px !important;
      }
      .v-text-align {
        text-align: center !important;
      }
    }
  </style>
</head>
<body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #f1f5f9; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!--[if mso]><div class="mso-container"><![endif]-->
  <table cellpadding="0" cellspacing="0" style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; min-width: 320px; margin: 0 auto; background-color: #f1f5f9; width: 100%;">
    <tbody>
      <tr>
        <td style="display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
          Nueva Solicitud de Apertura de Cuenta - PERC
        </td>
      </tr>
      <tr style="vertical-align: top;">
        <td style="border-collapse: collapse !important; vertical-align: top; padding: 20px 0;">
          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #f1f5f9;"><![endif]-->
          
          <div class="u-row-container" style="padding: 0px; background-color: transparent;">
            <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 650px; background-color: transparent;">
              <div style="border-collapse: collapse; display: table; width: 100%; height: 100%; background-color: transparent;">
                <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px; background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width: 650px;"><tr style="background-color: transparent;"><![endif]-->
                
                <div class="u-col u-col-100" style="max-width: 320px; min-width: 650px; display: table-cell; vertical-align: top;">
                  <div style="height: 100%; width: 100% !important;">
                    <div class="v-col-padding" style="height: 100%; padding: 0px;">
                      
                      <!-- Header -->
                      <table style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding" style="padding: 40px 30px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 12px 12px 0 0;" align="left">
                              <div class="v-text-align" style="line-height: 120%; text-align: center; word-wrap: break-word;">
                                <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Nueva Solicitud PERC</h1>
                                <p style="margin: 0; font-size: 14px; color: #cbd5e1; font-weight: 400; letter-spacing: 0.2px;">Formulario de Apertura de Cuenta</p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                    </div>
                  </div>
                </div>
                <!--[if mso]></td></tr></table></td></tr></table><![endif]-->
              </div>
            </div>
          </div>

          <div class="u-row-container" style="padding: 0px; background-color: transparent;">
            <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 650px; background-color: transparent;">
              <div style="border-collapse: collapse; display: table; width: 100%; height: 100%; background-color: transparent;">
                <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px; background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width: 650px;"><tr style="background-color: transparent;"><![endif]-->
                
                <div class="u-col u-col-100" style="max-width: 320px; min-width: 650px; display: table-cell; vertical-align: top;">
                  <div style="background-color: #ffffff; height: 100%; width: 100% !important; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
                    <div class="v-col-padding" style="height: 100%; padding: 40px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent;">
                      
                      <!-- Section Title -->
                      <table style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td style="padding: 0 0 32px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;" align="left">
                              <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #1e293b; letter-spacing: -0.3px; padding-bottom: 16px; border-bottom: 3px solid #e2e8f0;">Información del Formulario</h2>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <!-- Form Fields -->
                      <table style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td style="padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;" align="left">
                              ${fields}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <!-- Files List -->
                      ${filesList}
                      
                    </div>
                  </div>
                </div>
                <!--[if mso]></td></tr></table></td></tr></table><![endif]-->
              </div>
            </div>
          </div>

          <div class="u-row-container" style="padding: 0px; background-color: transparent;">
            <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 650px; background-color: transparent;">
              <div style="border-collapse: collapse; display: table; width: 100%; height: 100%; background-color: transparent;">
                <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px; background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width: 650px;"><tr style="background-color: transparent;"><![endif]-->
                
                <div class="u-col u-col-100" style="max-width: 320px; min-width: 650px; display: table-cell; vertical-align: top;">
                  <div style="background-color: transparent; height: 100%; width: 100% !important;">
                    <div class="v-col-padding" style="height: 100%; padding: 24px 0;">
                      
                      <!-- Footer -->
                      <table style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td style="padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;" align="center">
                              <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.6; text-align: center; font-weight: 400;">
                                Este email fue generado automáticamente por el sistema PERC.<br>
                                <span style="color: #94a3b8; font-size: 11px;">Por favor, no responder a este correo.</span>
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                    </div>
                  </div>
                </div>
                <!--[if mso]></td></tr></table></td></tr></table><![endif]-->
              </div>
            </div>
          </div>

          <!--[if mso]></td></tr></table><![endif]-->
        </td>
      </tr>
    </tbody>
  </table>
  <!--[if mso]></div><![endif]-->
</body>
</html>`;
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
