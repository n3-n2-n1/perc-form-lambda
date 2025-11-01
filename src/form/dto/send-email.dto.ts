export class SendEmailDto {
  formData: {
    socialDenomination?: string;
    cuitNumber?: string;
    email: string;
    [key: string]: unknown;
  };

  files: Array<{
    name: string;
    buffer: string;
    mimetype: string;
    category: string;
  }>;
}

