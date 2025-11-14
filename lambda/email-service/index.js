const { SESClient } = require("@aws-sdk/client-ses");
const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
const { generateEmailHTML } = require("./utils");

// Variables requeridas - SendGrid es opcional, SES es fallback
const requiredEnvVars = ["AWS_REGION", "EMAIL_TO", "FROM_EMAIL"];
const sendgridVars = ["SENDGRID_API_KEY"];

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
const hasSendGrid = sendgridVars.every((varName) => process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error("Missing required environment variables:", missingEnvVars.join(", "));
}

if (!hasSendGrid) {
  console.warn("SendGrid credentials not found, will use SES as fallback");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
});

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      SES: { ses: sesClient, aws: require("@aws-sdk/client-ses") },
    });
  }
  return transporter;
}

// Función para enviar email con SendGrid
async function sendWithSendGrid(mailOptions) {
  const msg = {
    to: mailOptions.to,
    from: process.env.FROM_EMAIL, // Usar la misma dirección FROM_EMAIL
    subject: mailOptions.subject,
    html: mailOptions.html,
    attachments: mailOptions.attachments?.map(attachment => ({
      content: attachment.content.toString('base64'),
      filename: attachment.filename,
      type: attachment.contentType,
      disposition: 'attachment',
    })),
  };

  const result = await sgMail.send(msg);
  return {
    messageId: result[0]?.headers?.['x-message-id'] || 'sendgrid-' + Date.now(),
    accepted: [mailOptions.to],
    rejected: [],
    service: 'sendgrid'
  };
}

// Función para enviar email con SES
async function sendWithSES(mailOptions) {
  const transporter = getTransporter();
  const result = await transporter.sendMail(mailOptions);
  return {
    ...result,
    service: 'ses'
  };
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function parseEvent(event) {
  if (typeof event === "string") {
    return JSON.parse(event);
  }
  if (event.body) {
    return JSON.parse(event.body);
  }
  return event;
}

function validateInput(parsedEvent) {
  const errors = [];

  if (!parsedEvent) {
    errors.push("Event payload is required");
    return { valid: false, errors };
  }

  const { formData, files = [] } = parsedEvent;

  if (!formData) {
    errors.push("formData is required");
  } else {
    if (!formData.email) {
      errors.push("formData.email is required");
    } else if (!validateEmail(formData.email)) {
      errors.push("formData.email must be a valid email address");
    }
  }

  // Validar archivos
  if (Array.isArray(files)) {
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    files.forEach((file, index) => {
      if (!file.buffer) {
        errors.push(`File at index ${index} is missing buffer`);
      } else {
        try {
          const buffer = Buffer.from(file.buffer, "base64");
          if (buffer.length > maxFileSize) {
            errors.push(`File ${file.name || `at index ${index}`} exceeds maximum size of 10MB`);
          }
        } catch (e) {
          errors.push(`File at index ${index} has invalid base64 buffer`);
        }
      }
      if (!file.mimetype) {
        errors.push(`File at index ${index} is missing mimetype`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    formData,
    files: files || [],
  };
}

function createResponse(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };
}

exports.handler = async (event) => {
  const startTime = Date.now();

  try {
    if (missingEnvVars.length > 0) {
      return createResponse(500, {
        success: false,
        error: `Missing required environment variables: ${missingEnvVars.join(", ")}`,
      });
    }

    let parsedEvent;
    try {
      parsedEvent = parseEvent(event);
    } catch (parseError) {
      console.error("Error parsing event:", parseError);
      return createResponse(400, {
        success: false,
        error: "Invalid JSON in event payload",
      });
    }

    // Validar entrada
    const validation = validateInput(parsedEvent);
    if (!validation.valid) {
      console.error("Validation errors:", validation.errors);
      return createResponse(400, {
        success: false,
        error: "Validation failed",
        details: validation.errors,
      });
    }

    const { formData, files } = validation;

    // Preparar attachments
    const attachments = files.map((file) => {
      const category = file.category || "unknown";
      const originalName = file.name || "document";
      const extension = originalName.split(".").pop() || "";
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
      const filename = `${category}_${nameWithoutExt}.${extension}`;

      return {
        filename: filename,
        content: Buffer.from(file.buffer, "base64"),
        contentType: file.mimetype,
      };
    });

    // Generar HTML del email
    const htmlContent = generateEmailHTML(formData, files);

    // Configurar opciones del email
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: process.env.EMAIL_TO,
      subject: `Nuevo Formulario PERC - ${formData.socialDenomination || "Sin nombre"}`,
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    // Enviar email - intentar SendGrid primero, SES como fallback
    let info;
    let usedService = 'unknown';

    try {
      if (hasSendGrid) {
        console.log("Attempting to send email with SendGrid...");
        info = await sendWithSendGrid(mailOptions);
        usedService = 'sendgrid';
        console.log("Email sent successfully with SendGrid");
      } else {
        throw new Error("SendGrid not configured");
      }
    } catch (sendgridError) {
      console.warn("SendGrid failed, falling back to SES:", sendgridError.message);

      try {
        console.log("Attempting to send email with SES...");
        info = await sendWithSES(mailOptions);
        usedService = 'ses';
        console.log("Email sent successfully with SES (fallback)");
      } catch (sesError) {
        console.error("Both SendGrid and SES failed:", {
          sendgridError: sendgridError.message,
          sesError: sesError.message
        });
        throw sesError; // Lanzar el error de SES
      }
    }

    const duration = Date.now() - startTime;

    console.log("Email sent successfully:", {
      service: usedService,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      duration: `${duration}ms`,
      attachmentsCount: attachments.length,
    });

    return createResponse(200, {
      success: true,
      messageId: info.messageId,
      service: usedService,
      message: `Email enviado correctamente via ${usedService.toUpperCase()}`,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error("Error sending email:", {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
    });

    // Determinar código de estado apropiado
    let statusCode = 500;
    if (error.code === "EAUTH" || error.code === "EENVELOPE") {
      statusCode = 400; // Errores de autenticación o configuración
    } else if (error.code === "ETIMEDOUT" || error.code === "ECONNECTION") {
      statusCode = 503; // Errores de conexión
    }

    return createResponse(statusCode, {
      success: false,
      error: error.message || "Unknown error occurred",
    });
  }
};
