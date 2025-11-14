import { Injectable, Logger } from "@nestjs/common";
import { EmailService } from "../email/email.service";
import { SendEmailDto } from "./dto/send-email.dto";

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);

  constructor(private readonly emailService: EmailService) {}

  async sendEmail(dto: SendEmailDto): Promise<unknown> {
    this.logger.log("Sending email via SendGrid...");
    try {
      return await this.emailService.sendEmail(dto);
    } catch (error) {
      this.logger.error(
        "SendGrid send failed:",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }
}
