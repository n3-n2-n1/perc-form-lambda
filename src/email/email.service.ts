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

      const [response] = await sgMail.send(msg);

      this.logger.log("Email sent successfully via SendGrid:", {
        statusCode: response.statusCode,
        headers: response.headers,
      });

      return {
        success: true,
        messageId: response.headers["x-message-id"] || "unknown",
        message: "Email enviado correctamente",
      };
    } catch (error) {
      this.logger.error("Error sending email:", error);
      throw error;
    }
  }
}
