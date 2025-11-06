import { Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

@Injectable()
export class LambdaService {
  private readonly lambdaClient: LambdaClient;
  private readonly functionName: string;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {
    const region = this.configService.get<string>("AWS_REGION", "us-east-1");

    this.lambdaClient = new LambdaClient({
      region,
    });

    this.functionName =
      this.configService.get<string>("EMAIL_LAMBDA_FUNCTION_NAME") ||
      "perc-email-service";
  }

  async invokeLambda(payload: unknown): Promise<unknown> {
    try {
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
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Error invoking Lambda: ${String(error)}`);
    }
  }
}
