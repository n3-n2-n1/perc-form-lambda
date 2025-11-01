import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  BadRequestException,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FormService } from './form.service';
import { SendEmailDto } from './dto/send-email.dto';

@Controller()
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Post('send-email')
  @UseInterceptors(FilesInterceptor('files'))
  async sendEmail(
    @Body('data') dataString: string,
    @Body('categories') categoriesInput: string | string[],
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    files?: Express.Multer.File[],
  ) {
    if (!dataString) {
      throw new BadRequestException('Data field is required');
    }

    let formData: Record<string, unknown>;
    try {
      formData = JSON.parse(dataString);
    } catch (error) {
      throw new BadRequestException('Invalid JSON in data field');
    }

    if (!formData.email || typeof formData.email !== 'string') {
      throw new BadRequestException('Email is required');
    }

    const filesArray = files || [];
    let categories: string[] = [];

    if (categoriesInput) {
      if (Array.isArray(categoriesInput)) {
        categories = categoriesInput;
      } else if (typeof categoriesInput === 'string') {
        categories = categoriesInput.split(',').map((c) => c.trim());
      }
    }

    if (filesArray.length > 0 && categories.length !== filesArray.length) {
      console.warn(
        `Mismatch: ${filesArray.length} files but ${categories.length} categories`,
      );
    }

    console.log('Received data:', {
      formDataKeys: Object.keys(formData),
      filesCount: filesArray.length,
      categoriesCount: categories.length,
      categories: categories,
    });

    const dto: SendEmailDto = {
      formData: formData as SendEmailDto['formData'],
      files: filesArray.map((file, index) => ({
        name: file.originalname,
        buffer: file.buffer.toString('base64'),
        mimetype: file.mimetype,
        category: categories[index] || 'unknown',
      })),
    };

    const result = await this.formService.sendEmail(dto);

    return {
      success: true,
      message: 'Formulario enviado correctamente',
      ...(result as Record<string, unknown>),
    };
  }
}

