import { Injectable, Logger, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LambdaService } from "../lambda/lambda.service";
import { EmailService } from "../email/email.service";
import { SendEmailDto } from "./dto/send-email.dto";

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);
  private readonly environment: string;

  constructor(
    private readonly lambdaService: LambdaService,
    private readonly emailService: EmailService,
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {
    this.environment =
      this.configService.get<string>("ENVIRONMENT") || "development";
  }

  async sendEmail(dto: SendEmailDto): Promise<unknown> {
    // Development: usar SendGrid directamente
    if (this.environment === "development") {
      this.logger.log("Development mode: using SendGrid directly");
      return await this.emailService.sendEmail(dto);
    }

    // Production: usar Lambda
    this.logger.log("Production mode: attempting to send email via Lambda...");
    try {
      return await this.lambdaService.invokeLambda(dto);
    } catch (error) {
      this.logger.error(
        "Lambda invocation failed in production:",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }
}
