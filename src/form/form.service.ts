import { Injectable } from '@nestjs/common';
import { LambdaService } from '../lambda/lambda.service';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class FormService {
  constructor(private readonly lambdaService: LambdaService) {}

  async sendEmail(dto: SendEmailDto): Promise<unknown> {
    return await this.lambdaService.invokeLambda(dto);
  }
}

