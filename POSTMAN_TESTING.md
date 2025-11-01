# Pruebas con Postman y cURL

## Endpoint
`POST http://localhost:3000/api/send-email`

## cURL Command (sin archivos)

```bash
curl -X POST http://localhost:3000/api/send-email \
  -F "data={\"socialDenomination\":\"Empresa Test S.A.\",\"cuitNumber\":\"20-12345678-9\",\"email\":\"test@example.com\",\"phone\":\"+5491123456789\",\"address\":\"Calle Falsa 123\"}" \
  -F "categories=balance,statute,balance"
```

## cURL Command (con archivos)

```bash
curl -X POST http://localhost:3000/api/send-email \
  -F "data={\"socialDenomination\":\"Empresa Test S.A.\",\"cuitNumber\":\"20-12345678-9\",\"email\":\"test@example.com\",\"phone\":\"+5491123456789\",\"address\":\"Calle Falsa 123\"}" \
  -F "files=@/ruta/al/archivo1.pdf" \
  -F "files=@/ruta/al/archivo2.pdf" \
  -F "files=@/ruta/al/archivo3.pdf" \
  -F "categories=balance,statute,balance"
```

## cURL Command (con archivos en macOS/Linux)

```bash
curl -X POST http://localhost:3000/api/send-email \
  -F "data={\"socialDenomination\":\"Empresa Test S.A.\",\"cuitNumber\":\"20-12345678-9\",\"email\":\"test@example.com\"}" \
  -F "files=@/Users/tu-usuario/Documents/archivo1.pdf" \
  -F "files=@/Users/tu-usuario/Documents/archivo2.pdf" \
  -F "categories=balance,statute"
```

## Configuración en Postman

### Método y URL
- **Método**: `POST`
- **URL**: `http://localhost:3000/api/send-email`

### Headers
No necesitas configurar headers manualmente, Postman los detecta automáticamente cuando usas `form-data`.

### Body (form-data)

1. Selecciona la pestaña **Body**
2. Selecciona **form-data**
3. Agrega los siguientes campos:

| Key | Type | Value |
|-----|------|-------|
| `data` | Text | `{"socialDenomination":"Empresa Test S.A.","cuitNumber":"20-12345678-9","email":"test@example.com","phone":"+5491123456789","address":"Calle Falsa 123"}` |
| `files` | File | Selecciona archivo 1 (ej: balance.pdf) |
| `files` | File | Selecciona archivo 2 (ej: statute.pdf) |
| `files` | File | Selecciona archivo 3 (ej: balance2.pdf) |
| `categories` | Text | `balance,statute,balance` |

**Nota importante**: En Postman, cuando agregas múltiples campos con el mismo nombre (`files`), asegúrate de que el tipo sea **File** y no Text.

### Ejemplo de datos JSON para el campo `data`

```json
{
  "socialDenomination": "Empresa Test S.A.",
  "cuitNumber": "20-12345678-9",
  "email": "test@example.com",
  "phone": "+5491123456789",
  "address": "Calle Falsa 123",
  "city": "Buenos Aires",
  "province": "CABA",
  "postalCode": "1000"
}
```

Este JSON debe ir como **string** en el campo `data` (no como JSON raw).

## Ejemplo completo en Postman

### Paso 1: Configurar Request
- Método: `POST`
- URL: `http://localhost:3000/api/send-email`

### Paso 2: Configurar Body
1. Selecciona **Body** → **form-data**
2. Agrega:
   - `data`: `{"email":"test@example.com","socialDenomination":"Test"}`
   - `files`: [File] - Selecciona tu primer archivo
   - `files`: [File] - Selecciona tu segundo archivo (si tienes)
   - `categories`: `balance,statute`

### Paso 3: Enviar Request

Deberías recibir una respuesta como:

```json
{
  "success": true,
  "message": "Formulario enviado correctamente",
  "statusCode": 200,
  "body": {
    "success": true,
    "messageId": "...",
    "message": "Email enviado correctamente"
  }
}
```

## Nota sobre errores sin credenciales

Si no tienes las credenciales AWS configuradas, el backend debería:
1. Recibir correctamente los datos y archivos
2. Intentar invocar Lambda
3. Fallar con un error relacionado con AWS (no con el formato de datos)

Esto te permitirá verificar que:
- El endpoint está funcionando
- Los datos se reciben correctamente
- Los archivos se procesan bien
- El formato es correcto

## Verificar logs en el backend

Cuando envíes el request, deberías ver en la consola del backend:

```
Received data: {
  formDataKeys: ['socialDenomination', 'cuitNumber', 'email', ...],
  filesCount: 2,
  categoriesCount: 2,
  categories: ['balance', 'statute']
}
```

## Troubleshooting

### Error: "Data field is required"
- Asegúrate de que el campo `data` esté en form-data (no en raw JSON)

### Error: "Invalid JSON in data field"
- Verifica que el JSON en `data` esté correctamente formateado
- Asegúrate de escapar las comillas dobles si es necesario

### Error: "Email is required"
- El JSON en `data` debe incluir el campo `email`

### Los archivos no se reciben
- Verifica que el tipo sea **File** y no Text en Postman
- Asegúrate de que el nombre del campo sea exactamente `files` (plural)

### Error de AWS Lambda
- Esto es esperado si no tienes credenciales configuradas
- El error debería aparecer después de procesar los datos correctamente

