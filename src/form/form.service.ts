import { Injectable, Logger } from '@nestjs/common';
import { LambdaService } from '../lambda/lambda.service';
import { EmailService } from '../email/email.service';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);

  constructor(
    private readonly lambdaService: LambdaService,
    private readonly emailService: EmailService,
  ) {}

  async sendEmail(dto: SendEmailDto): Promise<unknown> {
    try {
      this.logger.log('Attempting to send email via Lambda...');
      return await this.lambdaService.invokeLambda(dto);
    } catch (error) {
      this.logger.warn(
        'Lambda invocation failed, falling back to direct SMTP:',
        error instanceof Error ? error.message : String(error),
      );
      return await this.emailService.sendEmail(dto);
    }
  }
}

