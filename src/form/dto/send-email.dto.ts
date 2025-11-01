export class SendEmailDto {
  formData: {
    // Datos básicos del titular
    socialDenomination?: string;
    cuitNumber?: string;
    email: string;
    
    // Datos de contacto
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    
    // IP del cliente (obtenida en el frontend)
    clientIp?: string;
    
    // Permite campos adicionales del formulario
    [key: string]: unknown;
  };

  files: Array<{
    name: string;
    buffer: string;
    mimetype: string;
    category: string;
  }>;
}

