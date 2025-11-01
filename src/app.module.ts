import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { FormModule } from './form/form.module';
import { LambdaModule } from './lambda/lambda.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LambdaModule,
    FormModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

