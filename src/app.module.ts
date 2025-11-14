import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FormModule } from './form/form.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    FormModule,
  ],
})
export class AppModule {}

