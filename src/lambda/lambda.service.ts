import { Injectable, Inject, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

@Injectable()
export class LambdaService {
  private readonly logger = new Logger(LambdaService.name);
  private readonly lambdaClient: LambdaClient;
  private readonly functionName: string;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {
    const region = this.configService.get<string>("AWS_REGION", "us-east-1");
    const accessKeyId = this.configService.get<string>("AWS_ACCESS_KEY_ID");
    const secretAccessKey = this.configService.get<string>(
      "AWS_SECRET_ACCESS_KEY"
    );

    // Configurar credenciales si están disponibles
    const clientConfig: {
      region: string;
      credentials?: {
        accessKeyId: string;
        secretAccessKey: string;
      };
    } = {
      region,
    };

    if (accessKeyId && secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId,
        secretAccessKey,
      };
      this.logger.log("AWS credentials configured from environment variables");
    } else {
      this.logger.warn(
        "AWS credentials not found in environment variables. Using default AWS credential chain."
      );
    }

    this.lambdaClient = new LambdaClient(clientConfig);

    const functionName = this.configService.get<string>(
      "EMAIL_LAMBDA_FUNCTION_NAME"
    );

    if (!functionName) {
      const error = new Error(
        "EMAIL_LAMBDA_FUNCTION_NAME environment variable is required. " +
          "Please set it in your .env.local file."
      );
      this.logger.error(error.message);
      throw error;
    }

    this.functionName = functionName;
    this.logger.log(`Lambda function name configured: ${this.functionName}`);
  }

  async invokeLambda(payload: unknown): Promise<unknown> {
    try {
      this.logger.debug(`Invoking Lambda function: ${this.functionName}`);

      const command = new InvokeCommand({
        FunctionName: this.functionName,
        Payload: JSON.stringify(payload),
        InvocationType: "RequestResponse",
      });

      const response = await this.lambdaClient.send(command);

      if (response.FunctionError) {
        const errorPayload = response.Payload
          ? JSON.parse(new TextDecoder("utf-8").decode(response.Payload))
          : {};
        throw new Error(
          `Lambda error: ${response.FunctionError} - ${errorPayload.error || "Unknown error"}`
        );
      }

      if (!response.Payload) {
        throw new Error("Empty response from Lambda");
      }

      const result = JSON.parse(
        new TextDecoder("utf-8").decode(response.Payload)
      );

      if (result.body) {
        try {
          const bodyParsed =
            typeof result.body === "string"
              ? JSON.parse(result.body)
              : result.body;

          if (result.statusCode >= 400 || !bodyParsed.success) {
            const errorMessage =
              bodyParsed.error ||
              bodyParsed.message ||
              "Lambda returned an error";
            const error = new Error(errorMessage);
            (error as any).statusCode = result.statusCode;
            (error as any).details = bodyParsed.details;
            throw error;
          }

          return bodyParsed;
        } catch (parseError) {
          return result;
        }
      }

      return result;
    } catch (error) {
      // Manejo específico para errores de permisos de AWS
      if (error instanceof Error) {
        const errorMessage = error.message;
        // Para otros errores, lanzar el error original
        this.logger.error(`Error invoking Lambda: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      throw new Error(`Error invoking Lambda: ${String(error)}`);
    }
  }
}
