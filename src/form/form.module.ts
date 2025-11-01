import { Module } from '@nestjs/common';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { LambdaModule } from '../lambda/lambda.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [LambdaModule, EmailModule],
  controllers: [FormController],
  providers: [FormService],
})
export class FormModule {}

