import { Injectable, Inject, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as sgMail from "@sendgrid/mail";
import { SendEmailDto } from "../form/dto/send-email.dto";
import { generateEmailHTML } from "../../utils/utils";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {
    sgMail.setApiKey(this.configService.get<string>("SENDGRID_API_KEY"));
  }

  async sendEmail(dto: SendEmailDto): Promise<unknown> {
    try {
      const recipientEmail = this.configService.get<string>("EMAIL_TO");

      const attachments = dto.files.map((file) => {
        const category = file.category || "unknown";
        const originalName = file.name || "document";
        const extension = originalName.split(".").pop() || "";
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
        const filename = `${category}_${nameWithoutExt}.${extension}`;

        return {
          content: file.buffer,
          filename: filename,
          type: file.mimetype,
          disposition: "attachment",
        };
      });

      const htmlContent = generateEmailHTML(dto.formData, dto.files);

      const msg = {
        to: recipientEmail,
        from: this.configService.get<string>("SMTP_FROM"),
        subject: `Nuevo Formulario PERC - ${dto.formData.socialDenomination || "Sin nombre"}`,
        html: htmlContent,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      // 🔥 FIRE AND FORGET: Enviar sin esperar respuesta
      sgMail.send(msg)
        .then((result) => {
          this.logger.log("✅ Email sent successfully via SendGrid:", {
            messageId: result[0]?.headers?.['x-message-id'],
            statusCode: result[0]?.statusCode,
          });
        })
        .catch((error) => {
          this.logger.error("❌ SendGrid async error:", {
            message: error.message,
            code: error.code,
            response: error.response?.body
          });
          // Aquí se podría implementar:
          // - Reintento automático
          // - Notificación de error
          // - Guardado en BD para tracking
        });

      // ✅ Respuesta inmediata al cliente
      return {
        success: true,
        messageId: `sendgrid-async-${Date.now()}`,
        message: "Email enviado correctamente (procesamiento en background)",
        processing: "background"
      };

    } catch (error) {
      this.logger.error("❌ Error preparing email:", error);
      throw error;
    }
  }
}
