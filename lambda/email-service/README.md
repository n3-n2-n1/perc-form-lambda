# Lambda Email Service

Lambda function para el envío de emails del formulario PERC.

## Configuración

Variables de entorno requeridas:

- `AWS_REGION`: Región de AWS (default: us-east-1)
- `USE_SES`: Usar AWS SES (true) o SendGrid/SMTP (false)
- `RECIPIENT_EMAIL`: Email destino (default: email del formulario)
- `FROM_EMAIL`: Email remitente

Si `USE_SES=false`:
- `SMTP_HOST`: Host SMTP (default: smtp.sendgrid.net)
- `SMTP_PORT`: Puerto SMTP (default: 587)
- `SMTP_USER`: Usuario SMTP (default: apikey)
- `SMTP_PASSWORD` o `SENDGRID_API_KEY`: Contraseña/API key

## Deploy

```bash
cd lambda/email-service
npm install
zip -r email-service.zip . -x "*.git*" "node_modules/.cache/*"
```

