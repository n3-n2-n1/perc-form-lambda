# Backend - NestJS + AWS Lambda para Email

Backend NestJS con AWS Lambda para el envío de emails del formulario PERC.

## Arquitectura

```
Angular Frontend → NestJS API → (Lambda + AWS SES) o (SendGrid)
```

**Comportamiento según entorno:**
- `ENVIRONMENT=development` → Usa SendGrid directamente
- `ENVIRONMENT=production` → Usa Lambda + AWS SES (sin fallback)

## Instalar dependencias

```bash
pnpm install
```

## Configurar variables de entorno

**Backend NestJS** - Crear archivo `.env` en la raíz del proyecto:

### Desarrollo (SendGrid)

```env
ENVIRONMENT=development

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SMTP_FROM=noreply@perc.com
EMAIL_TO=destino@perc.com

PORT=3000
```

### Producción (Lambda + AWS SES)

```env
ENVIRONMENT=production

# AWS Lambda
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
EMAIL_LAMBDA_FUNCTION_NAME=perc-email-service

PORT=3000
```

**Nota**: En producción, si Lambda falla, el error se lanza (no hay fallback a SendGrid).


## Desarrollo

```bash
npm run start:dev
```

La aplicación estará disponible en `http://localhost:3000/api`

## Endpoints

POST /api/send-email

## Build para Producción

```bash
npm run build
npm run start:prod
```

## Notas

- El tamaño máximo de archivo es 10MB por archivo
