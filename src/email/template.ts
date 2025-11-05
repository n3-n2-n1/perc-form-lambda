const emailTemplate = (fields: string, filesList: string) => {
  return `
<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Nueva Solicitud PERC</title>
  <style type="text/css">
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .email-container {
        background-color: #0f172a !important;
      }
      .email-body {
        background-color: #1e293b !important;
        color: #f1f5f9 !important;
      }
      .header-bg {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
      }
      .card-bg {
        background-color: #1e293b !important;
        border-color: #334155 !important;
      }
      .text-primary {
        color: #f1f5f9 !important;
      }
      .text-secondary {
        color: #cbd5e1 !important;
      }
      .text-muted {
        color: #94a3b8 !important;
      }
      .divider {
        border-color: #334155 !important;
      }
    }
    
    /* Reset & Base */
    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8fafc;
    }
    
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    
    /* Container */
    .email-container {
      width: 100%;
      background-color: #f8fafc;
      padding: 32px 16px;
    }
    
    .email-wrapper {
      max-width: 680px;
      margin: 0 auto;
    }
    
    /* Header */
    .header {
      background: linear-gradient(135deg,rgb(186, 16, 16) 0%,rgb(26, 41, 155) 100%);
      border-radius: 16px 16px 0 0;
      padding: 48px 40px;
      text-align: center;
    }
    
    .header-title {
      margin: 0 0 12px 0;
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }
    
    .header-subtitle {
      margin: 0;
      font-size: 15px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 400;
      letter-spacing: 0.2px;
    }
    
    /* Body */
    .email-body {
      background-color: #ffffff;
      border-radius: 0 0 16px 16px;
      padding: 48px 40px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    /* Section */
    .section-title {
      margin: 0 0 32px 0;
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.3px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    /* Fields Grid - Masonry Layout */
    .fields-grid {
      display: block;
      width: 100%;
    }
    
    /* Responsive */
    @media only screen and (max-width: 680px) {
      .email-container {
        padding: 16px 8px;
      }
      .header {
        padding: 32px 24px;
        border-radius: 12px 12px 0 0;
      }
      .header-title {
        font-size: 26px;
      }
      .email-body {
        padding: 32px 24px;
        border-radius: 0 0 12px 12px;
      }
      .section-title {
        font-size: 18px;
      }
    }
    
    /* MSO Fixes */
    .u-row {
      width: 680px;
    }
    
    .u-col {
      vertical-align: top;
      display: inline-block;
    }
    
    @media only screen and (max-width: 680px) {
      .u-row {
        width: 100% !important;
      }
      .u-col {
        width: 100% !important;
        display: block !important;
      }
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    .u-row {
      width: 680px;
    }
    .u-col {
      display: table-cell;
      vertical-align: top;
    }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="display: none; max-height: 0; overflow: hidden; color: transparent; font-size: 0; line-height: 0;">
    Nueva Solicitud de Apertura de Cuenta - PERC
  </div>
  
  <!--[if mso]>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="background-color: #f8fafc; padding: 32px 16px;">
  <![endif]-->
  
  <div class="email-container" style="background-color: #f8fafc; padding: 32px 16px;">
    <div class="email-wrapper" style="max-width: 680px; margin: 0 auto;">
      
      <!-- Header -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 0;">
        <tr>
          <td class="header" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0; padding: 48px 40px; text-align: center;">
            <h1 class="header-title" style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; line-height: 1.2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">
              Nueva Solicitud PERC
            </h1>
            <p class="header-subtitle" style="margin: 0; font-size: 15px; color: rgba(255, 255, 255, 0.9); font-weight: 400; letter-spacing: 0.2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">
              Formulario de Apertura de Cuenta
            </p>
          </td>
        </tr>
      </table>
      
      <!-- Body -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 0;">
        <tr>
          <td class="email-body" style="background-color: #ffffff; border-radius: 0 0 16px 16px; padding: 48px 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            
            <!-- Section Title -->
            <h2 class="section-title" style="margin: 0 0 32px 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">
              Información del Formulario
            </h2>
            
            <!-- Fields Grid -->
            <div class="fields-grid">
              ${fields}
            </div>
            
            <!-- Files List -->
            ${filesList}
            
          </td>
        </tr>
      </table>
      
      <!-- Footer -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 32px;">
        <tr>
          <td style="padding: 0; text-align: center;">
            <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">
              Este email fue generado automáticamente por el sistema PERC.<br>
              <span style="color: #94a3b8; font-size: 12px;">Por favor, no responder a este correo.</span>
            </p>
          </td>
        </tr>
      </table>
      
    </div>
  </div>
  
  <!--[if mso]>
      </td>
    </tr>
  </table>
  <![endif]-->
</body>
</html>
  `;
};

export default emailTemplate;
