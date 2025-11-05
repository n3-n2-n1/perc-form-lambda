# Lambda Email Service

Función Lambda para el envío de emails del formulario PERC usando **AWS SES**.

## Descripción

Esta función Lambda se ejecuta en AWS y envía emails usando AWS SES. Es invocada desde el backend NestJS mediante el SDK de AWS.

## Configuración

### Variables de entorno requeridas en Lambda:

- `AWS_REGION`: Región de AWS donde está configurada Lambda (ej: `us-east-1`)
- `RECIPIENT_EMAIL`: Email destino donde se enviarán los formularios
- `FROM_EMAIL`: Email remitente (debe estar verificado en SES)

### Permisos IAM requeridos:

La función Lambda necesita un rol IAM con permisos para:
- `ses:SendEmail`
- `ses:SendRawEmail`

Ejemplo de política IAM mínima:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

## Deploy

1. Instalar dependencias:
```bash
cd lambda/email-service
npm install
```

2. Crear el archivo ZIP:
```bash
zip -r email-service.zip . -x "*.git*" "node_modules/.cache/*" "*.zip"
```

3. Crear/Actualizar Lambda en AWS:

**Crear nueva función:**
```bash
aws lambda create-function \
  --function-name perc-email-service \
  --runtime nodejs20.x \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://email-service.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables="{
    AWS_REGION=us-east-1,
    RECIPIENT_EMAIL=destino@perc.com,
    FROM_EMAIL=noreply@perc.com
  }"
```

**Actualizar función existente:**
```bash
aws lambda update-function-code \
  --function-name perc-email-service \
  --zip-file fileb://email-service.zip
```

**Actualizar variables de entorno:**
```bash
aws lambda update-function-configuration \
  --function-name perc-email-service \
  --environment Variables="{
    AWS_REGION=us-east-1,
    RECIPIENT_EMAIL=destino@perc.com,
    FROM_EMAIL=noreply@perc.com
  }"
```

## Estructura

- `index.js`: Handler principal de la Lambda
- `utils.js`: Utilidades para generar el HTML del email (template profesional)

## Payload esperado

La Lambda espera recibir un payload con esta estructura:

```json
{
  "formData": {
    "email": "usuario@example.com",
    "socialDenomination": "Empresa S.A.",
    ...
  },
  "files": [
    {
      "name": "documento.pdf",
      "buffer": "base64encoded...",
      "mimetype": "application/pdf",
      "category": "balance"
    }
  ]
}
```

## Respuesta

La Lambda retorna:

**Éxito (200):**
```json
{
  "statusCode": 200,
  "body": "{\"success\": true, \"messageId\": \"...\", \"message\": \"Email enviado correctamente\"}"
}
```

**Error (400/500):**
```json
{
  "statusCode": 400,
  "body": "{\"success\": false, \"error\": \"...\"}"
}
```

## Notas

- El email se genera con un template HTML profesional usando las mismas utilidades que el backend NestJS
- Los archivos adjuntos se convierten desde base64 a Buffer antes de enviarse
- El email incluye todos los datos del formulario formateados y los archivos adjuntos categorizados
