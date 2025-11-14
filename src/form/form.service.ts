import { Injectable, Logger } from "@nestjs/common";
import { LambdaService } from "../lambda/lambda.service";
import { EmailService } from "../email/email.service";
import { SendEmailDto } from "./dto/send-email.dto";

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);
  private readonly MAX_LAMBDA_PAYLOAD = 6 * 1024 * 1024; // 6MB limit

  constructor(
    private readonly lambdaService: LambdaService,
    private readonly emailService: EmailService
  ) {}

  async sendEmail(dto: SendEmailDto): Promise<unknown> {
    // Calcular el tamaño aproximado del payload
    const payloadSize = this.calculatePayloadSize(dto);

    if (payloadSize > this.MAX_LAMBDA_PAYLOAD) {
      this.logger.log(`Payload too large (${payloadSize} bytes), sending directly via SendGrid...`);
      try {
        return await this.emailService.sendEmail(dto);
      } catch (error) {
        this.logger.error(
          "SendGrid direct send failed:",
          error instanceof Error ? error.message : String(error)
        );
        throw error;
      }
    }

    this.logger.log(`Payload size (${payloadSize} bytes), sending via Lambda...`);
    try {
      return await this.lambdaService.invokeLambda(dto);
    } catch (error) {
      this.logger.error(
        "Lambda invocation failed:",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  private calculatePayloadSize(dto: SendEmailDto): number {
    // Calcular tamaño aproximado del JSON + archivos
    const formDataSize = JSON.stringify(dto.formData).length;
    const filesSize = dto.files.reduce((total, file) => {
      return total + (file.buffer?.length || 0);
    }, 0);

    // Overhead aproximado para metadata
    const overhead = 1024;

    return formDataSize + filesSize + overhead;
  }
}
