import { Injectable, Logger } from "@nestjs/common";
import { LambdaService } from "../lambda/lambda.service";
import { SendEmailDto } from "./dto/send-email.dto";

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);

  constructor(private readonly lambdaService: LambdaService) {}

  async sendEmail(dto: SendEmailDto): Promise<unknown> {
    this.logger.log("Sending email via Lambda...");
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
}
