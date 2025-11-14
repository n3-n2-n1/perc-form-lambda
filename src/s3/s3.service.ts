// import { Injectable, Inject, Logger } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { v4 as uuidv4 } from "uuid";

// @Injectable()
// export class S3Service {
//   private readonly logger = new Logger(S3Service.name);
//   private readonly s3Client: S3Client;
//   private readonly bucketName: string;

//   constructor(
//     @Inject(ConfigService) private readonly configService: ConfigService
//   ) {
//     const region = this.configService.get<string>("AWS_REGION", "us-east-1");
//     const accessKeyId = this.configService.get<string>("AWS_ACCESS_KEY_ID");
//     const secretAccessKey = this.configService.get<string>(
//       "AWS_SECRET_ACCESS_KEY"
//     );

//     const clientConfig: {
//       region: string;
//       credentials?: {
//         accessKeyId: string;
//         secretAccessKey: string;
//       };
//     } = {
//       region,
//     };

//     if (accessKeyId && secretAccessKey) {
//       clientConfig.credentials = {
//         accessKeyId,
//         secretAccessKey,
//       };
//       this.logger.log("AWS S3 credentials configured from environment variables");
//     } else {
//       this.logger.warn(
//         "AWS S3 credentials not found. Using default AWS credential chain."
//       );
//     }

//     this.s3Client = new S3Client(clientConfig);

//     const bucketName = this.configService.get<string>("S3_BUCKET_NAME");
//     if (!bucketName) {
//       const error = new Error(
//         "S3_BUCKET_NAME environment variable is required. " +
//           "Please set it in your .env.local file."
//       );
//       this.logger.error(error.message);
//       throw error;
//     }

//     this.bucketName = bucketName;
//     this.logger.log(`S3 bucket configured: ${this.bucketName}`);
//   }

//   async uploadFile(
//     file: Express.Multer.File,
//     category: string
//   ): Promise<string> {
//     try {
//       // Validar que el archivo tiene buffer
//       if (!file.buffer) {
//         throw new Error(`File ${file.originalname} does not have a buffer`);
//       }

//       if (!Buffer.isBuffer(file.buffer)) {
//         throw new Error(`File ${file.originalname} buffer is not a valid Buffer`);
//       }

//       if (file.buffer.length === 0) {
//         throw new Error(`File ${file.originalname} buffer is empty`);
//       }

//       // Generar key único con estructura: category/YYYY/MM/DD/uuid-originalname
//       const now = new Date();
//       const year = now.getFullYear();
//       const month = String(now.getMonth() + 1).padStart(2, "0");
//       const day = String(now.getDate()).padStart(2, "0");
//       const uuid = uuidv4();
//       const sanitizedCategory = category.replace(/[^a-zA-Z0-9-_]/g, "_");
//       const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");

//       const s3Key = `${sanitizedCategory}/${year}/${month}/${day}/${uuid}-${sanitizedName}`;

//       this.logger.debug(`Uploading file to S3: ${s3Key}`);

//       const command = new PutObjectCommand({
//         Bucket: this.bucketName,
//         Key: s3Key,
//         Body: file.buffer,
//         ContentType: file.mimetype,
//         Metadata: {
//           originalName: file.originalname,
//           category: category,
//           uploadedAt: now.toISOString(),
//         },
//       });

//       await this.s3Client.send(command);

//       this.logger.log(`File uploaded successfully to S3: ${s3Key}`);
//       return s3Key;
//     } catch (error) {
//       this.logger.error(
//         `Error uploading file to S3: ${error instanceof Error ? error.message : String(error)}`
//       );
//       throw new Error(
//         `Failed to upload file to S3: ${error instanceof Error ? error.message : String(error)}`
//       );
//     }
//   }

//   async uploadFiles(
//     files: Express.Multer.File[],
//     categories: string[]
//   ): Promise<string[]> {
//     const uploadPromises = files.map((file, index) =>
//       this.uploadFile(file, categories[index] || "unknown")
//     );

//     return Promise.all(uploadPromises);
//   }
// }

