export class SendEmailDto {
  formData: {
    socialDenomination?: string;
    cuitNumber?: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    clientIp?: string;
    [key: string]: unknown;
  };

  files: Array<{
    name: string;
    buffer: string;
    mimetype: string;
    category: string;
  }>;
}
