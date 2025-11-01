import { Module, Global } from '@nestjs/common';
import { LambdaService } from './lambda.service';

@Global()
@Module({
  providers: [LambdaService],
  exports: [LambdaService],
})
export class LambdaModule {}

