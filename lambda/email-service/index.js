const { SESClient } = require('@aws-sdk/client-ses');
const nodemailer = require('nodemailer');

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

function createTransporter() {
  if (process.env.USE_SES === 'true') {
    return nodemailer.createTransport({
      SES: { ses: sesClient, aws: require('@aws-sdk/client-ses') },
    });
  }

  const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'apikey',
      pass: process.env.SMTP_PASSWORD || process.env.SENDGRID_API_KEY,
    },
  };

  if (smtpConfig.port === 465) {
    smtpConfig.secure = true;
  }

  return nodemailer.createTransport(smtpConfig);
}

function generateEmailHTML(formData, files = []) {
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

  const filesList = files.length > 0
    ? `
      <h2>Archivos Adjuntos</h2>
      <ul class="files-list">
        ${files.map((file) => {
          const category = file.category || 'unknown';
          const originalName = file.name || 'document';
          return `
            <li>
              <span class="category">[${category}]</span>
              <span class="filename">${originalName}</span>
            </li>
          `;
        }).join('')}
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

exports.handler = async (event) => {
  try {
    let parsedEvent;
    if (typeof event === 'string') {
      parsedEvent = JSON.parse(event);
    } else if (event.body) {
      parsedEvent = JSON.parse(event.body);
    } else {
      parsedEvent = event;
    }

    const { formData, files = [] } = parsedEvent;

    if (!formData || !formData.email) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Form data and email are required',
        }),
      };
    }

    const transporter = createTransporter();
    const recipientEmail =
      process.env.RECIPIENT_EMAIL || formData.email;

    const attachments = files.map((file) => {
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

    const htmlContent = generateEmailHTML(formData, files);

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@perc.com',
      to: recipientEmail,
      subject: `Nuevo Formulario PERC - ${formData.socialDenomination || 'Sin nombre'}`,
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: info.messageId,
        message: 'Email enviado correctamente',
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
      }),
    };
  }
};

