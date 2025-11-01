# Backend - NestJS + AWS Lambda para Email

Backend NestJS con AWS Lambda para el envío de emails del formulario PERC.

## Arquitectura

```
Angular Frontend → NestJS API → AWS Lambda → Email (SES/SendGrid)
```

## Estructura del Proyecto

```
perc-lambda/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── form/
│   │   ├── form.module.ts
│   │   ├── form.controller.ts
│   │   ├── form.service.ts
│   │   └── dto/
│   │       └── send-email.dto.ts
│   └── lambda/
│       ├── lambda.module.ts
│       └── lambda.service.ts
├── lambda/
│   └── email-service/
│       ├── index.js
│       ├── package.json
│       └── README.md
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Setup Inicial

### Instalar dependencias

```bash
npm install
```

### Configurar variables de entorno

**Backend NestJS** - Crear archivo `.env` en la raíz del proyecto:

```env
# Región de AWS donde está la Lambda
AWS_REGION=us-east-1

# Credenciales AWS (solo necesarias en desarrollo local)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Nombre de la función Lambda
EMAIL_LAMBDA_FUNCTION_NAME=perc-email-service

# Puerto del servidor (opcional)
PORT=3000
```

**Lambda Function** - Configurar en AWS Console (Configuration > Environment variables):

**Opción 1: AWS SES**
```env
USE_SES=true
RECIPIENT_EMAIL=destino@perc.com
FROM_EMAIL=noreply@perc.com
```

**Opción 2: SendGrid**
```env
USE_SES=false
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
RECIPIENT_EMAIL=destino@perc.com
FROM_EMAIL=noreply@perc.com
```

**Nota importante:** Las variables de email (`USE_SES`, `RECIPIENT_EMAIL`, `FROM_EMAIL`, etc.) se configuran en la Lambda Function, no en el backend NestJS.

Ver `ENV_VARIABLES.md` para documentación completa de todas las variables.

## Desarrollo

```bash
npm run start:dev
```

La aplicación estará disponible en `http://localhost:3000/api`

## Endpoints

### POST /api/send-email

Envía el formulario PERC con archivos adjuntos a través de Lambda.

Body (FormData):
- `data`: JSON string con los datos del formulario
- `files`: Archivos adjuntos (opcional)

Ejemplo:

```javascript
const formData = new FormData();
formData.append('data', JSON.stringify({
  socialDenomination: 'Empresa S.A.',
  cuitNumber: '20-12345678-9',
  email: 'contacto@empresa.com'
}));
formData.append('files', file1);
formData.append('files', file2);

fetch('http://localhost:3000/api/send-email', {
  method: 'POST',
  body: formData
});
```

### POST /api/get-ip

Obtiene la IP del cliente que hace la petición.

## Deploy Lambda

### Preparar Lambda Function

```bash
cd lambda/email-service
npm install
zip -r email-service.zip . -x "*.git*" "node_modules/.cache/*"
```

### Crear/Actualizar Lambda en AWS

```bash
aws lambda create-function \
  --function-name perc-email-service \
  --runtime nodejs20.x \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://email-service.zip \
  --timeout 30 \
  --memory-size 512

# O actualizar función existente
aws lambda update-function-code \
  --function-name perc-email-service \
  --zip-file fileb://email-service.zip
```

### Configurar variables de entorno en Lambda

```bash
aws lambda update-function-configuration \
  --function-name perc-email-service \
  --environment Variables="{
    AWS_REGION=us-east-1,
    USE_SES=true,
    RECIPIENT_EMAIL=destino@perc.com,
    FROM_EMAIL=noreply@perc.com
  }"
```

## Build para Producción

```bash
npm run build
npm run start:prod
```

## Principios SOLID Implementados

- Single Responsibility: Cada servicio tiene una responsabilidad única
- Open/Closed: Módulos extensibles mediante configuración
- Liskov Substitution: Interfaces claras para servicios
- Interface Segregation: Módulos específicos (FormModule, LambdaModule)
- Dependency Inversion: Inyección de dependencias mediante NestJS

## Características

- Validación de datos con class-validator
- Manejo de archivos con Multer
- Configuración centralizada con ConfigModule
- Manejo de errores robusto
- CORS habilitado
- Logging estructurado

## Notas

- Las credenciales de AWS se configuran mediante variables de entorno
- Si no se proporcionan credenciales, Lambda usará el rol IAM asignado
- Los archivos se convierten a base64 para enviar a Lambda
- El tamaño máximo de archivo es 10MB por archivo
