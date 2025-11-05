import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

@Injectable()
export class LambdaService {
  private readonly lambdaClient: LambdaClient;
  private readonly functionName: string;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    this.lambdaClient = new LambdaClient({
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });

    this.functionName =
      this.configService.get<string>('EMAIL_LAMBDA_FUNCTION_NAME') ||
      'perc-email-service';
  }

  async invokeLambda(payload: unknown): Promise<unknown> {
    try {
      const command = new InvokeCommand({
        FunctionName: this.functionName,
        Payload: JSON.stringify(payload),
        InvocationType: 'RequestResponse',
      });

      const response = await this.lambdaClient.send(command);

      if (response.FunctionError) {
        const errorPayload = response.Payload
          ? JSON.parse(new TextDecoder('utf-8').decode(response.Payload))
          : {};
        throw new Error(
          `Lambda error: ${response.FunctionError} - ${errorPayload.error || 'Unknown error'}`,
        );
      }

      if (!response.Payload) {
        throw new Error('Empty response from Lambda');
      }

      const result = JSON.parse(
        new TextDecoder('utf-8').decode(response.Payload),
      );

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error invoking Lambda: ${error.message}`);
      }
      throw error;
    }
  }
}

