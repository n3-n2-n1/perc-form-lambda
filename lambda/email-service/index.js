const { SESClient } = require("@aws-sdk/client-ses");
const nodemailer = require("nodemailer");
const { generateEmailHTML } = require("./utils");

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
});

function createTransporter() {
  return nodemailer.createTransport({
    SES: { ses: sesClient, aws: require("@aws-sdk/client-ses") },
  });
}

exports.handler = async (event) => {
  try {
    let parsedEvent;
    if (typeof event === "string") {
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
          error: "Form data and email are required",
        }),
      };
    }

    const transporter = createTransporter();
    const recipientEmail = process.env.RECIPIENT_EMAIL;

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

    const htmlContent = generateEmailHTML(formData, files);

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: recipientEmail,
      subject: `Nuevo Formulario PERC - ${formData.socialDenomination || "Sin nombre"}`,
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: info.messageId,
        message: "Email enviado correctamente",
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
      }),
    };
  }
};
