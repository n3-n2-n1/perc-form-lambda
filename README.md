# Backend - NestJS + AWS Lambda para Email

Backend NestJS con AWS Lambda para el envío de emails del formulario PERC.

## Arquitectura

```
Angular Frontend → NestJS API → AWS Lambda → AWS SES
```

**Flujo:**
- El backend NestJS invoca una función Lambda
- La Lambda envía el email usando AWS SES
- Las credenciales se obtienen automáticamente del rol IAM asignado

## Instalar dependencias

```bash
pnpm install
```

## Configurar variables de entorno

**Backend NestJS** - Crear archivo `.env` en la raíz del proyecto:

### Configuración (Lambda + AWS SES)

```env
# AWS Lambda
AWS_REGION=us-east-1
EMAIL_LAMBDA_FUNCTION_NAME=perc-email-service
PORT=3000
```

## Desarrollo

```bash
pnpm run start:dev
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
