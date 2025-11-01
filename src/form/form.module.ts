import { Module } from '@nestjs/common';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { LambdaModule } from '../lambda/lambda.module';

@Module({
  imports: [LambdaModule],
  controllers: [FormController],
  providers: [FormService],
})
export class FormModule {}

