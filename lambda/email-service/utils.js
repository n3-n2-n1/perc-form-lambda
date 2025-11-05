const LABEL_TRANSLATIONS = {
  socialDenomination: "Denominación Social",
  cuitNumber: "Número de CUIT",
  societyType: "Tipo de Sociedad",
  order: "Orden",
  sector: "Sector",
  activityType: "Tipo de Actividad",
  activityStartDate: "Fecha de Inicio de Actividad",
  countryOfInscription: "País de Inscripción",
  inscriptIn: "Inscripto en",
  inscriptionNumber: "Número de Inscripción",
  email: "Correo Electrónico",
  phone: "Teléfono",
  address: "Dirección",
  city: "Ciudad",
  province: "Provincia",
  postalCode: "Código Postal",
  clientIp: "IP del Cliente",
  legalAddress: "Dirección Legal",
  realAddress: "Dirección Real",
  street: "Calle",
  subjectObliged: "Sujeto Obligado",
  fiscalResidenceArgentina: "Residencia Fiscal Argentina",
  fiscalResidenceCountry: "País de Residencia Fiscal",
  fiscalResidenceAddress: "Dirección de Residencia Fiscal",
  finalBeneficiaries: "Beneficiarios Finales",
  directors: "Directores",
  name: "Nombre",
  document: "Documento",
  percentage: "Porcentaje",
  position: "Cargo",
  acceptTerms: "Acepta Términos",
  comments: "Comentarios",
  additionalInfo: "Información Adicional",
};

const CATEGORY_TRANSLATIONS = {
  balance: "Balance",
  statute: "Estatuto",
  designAuthorities: "Designación de Autoridades",
  dniFront: "DNI Frente",
  dniBack: "DNI Dorso",
  unknown: "Desconocido",
};

const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";

function translateLabel(key) {
  const normalizedKey = key.trim().toLowerCase();
  const found = Object.entries(LABEL_TRANSLATIONS).find(
    ([k]) => k.toLowerCase() === normalizedKey || k.toLowerCase() === normalizedKey.replace(/\s+/g, "")
  );
  if (found) return found[1];
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();
}

function translateCategory(category) {
  return CATEGORY_TRANSLATIONS[category] || category;
}

function formatPrimitive(value) {
  if (value === null || value === undefined) {
    return `<span style="color: #94a3b8; font-style: italic; font-family: ${FONT_FAMILY};">No especificado</span>`;
  }
  if (typeof value === "boolean") {
    const badgeColor = value ? "#10b981" : "#ef4444";
    const badgeText = value ? "SI" : "NO";
    return `<span style="display: inline-block; padding: 6px 14px; background-color: ${badgeColor}; color: #ffffff; border-radius: 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; font-family: ${FONT_FAMILY};">${badgeText}</span>`;
  }
  return `<span style="color: #0f172a; font-family: ${FONT_FAMILY};">${String(value)}</span>`;
}

function formatObject(obj) {
  const entries = Object.entries(obj)
    .map(([key, val]) => {
      const label = translateLabel(key);
      let formattedVal;
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        formattedVal = formatObject(val);
      } else {
        formattedVal = formatPrimitive(val);
      }
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
          <tr>
            <td style="padding: 0;">
              <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-family: ${FONT_FAMILY};">${label}</p>
              <p style="margin: 0; color: #0f172a; font-size: 15px; line-height: 1.7; font-family: ${FONT_FAMILY};">${formattedVal}</p>
            </td>
          </tr>
        </table>
      `;
    })
    .join("");
  return entries || `<span style="color: #94a3b8; font-style: italic; font-family: ${FONT_FAMILY};">No especificado</span>`;
}

function formatValue(value) {
  if (value === null || value === undefined) {
    return `<span style="color: #94a3b8; font-style: italic; font-family: ${FONT_FAMILY};">No especificado</span>`;
  }
  if (typeof value === "boolean") {
    const badgeColor = value ? "#10b981" : "#ef4444";
    const badgeText = value ? "SI" : "NO";
    return `<span style="display: inline-block; padding: 6px 14px; background-color: ${badgeColor}; color: #ffffff; border-radius: 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; font-family: ${FONT_FAMILY};">${badgeText}</span>`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `<span style="color: #94a3b8; font-style: italic; font-family: ${FONT_FAMILY};">No especificado</span>`;
    }
    return value
      .map((item, index) => {
        if (typeof item === "object" && item !== null) {
          const header = `<p style="margin: 0; color: #6366f1; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; font-family: ${FONT_FAMILY};">Registro ${index + 1}</p>`;
          const content = `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding: 0 0 14px 0; border-bottom: 1px solid #e2e8f0;">${header}</td>
              </tr>
              <tr>
                <td style="padding: 16px 0 0 0;">${formatObject(item)}</td>
              </tr>
            </table>
          `;
          return `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px; border-collapse: separate;">
              <tr>
                <td style="padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; border-left: 4px solid #6366f1; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
                  ${content}
                </td>
              </tr>
            </table>
          `;
        }
        const bullet = `<span style="display: inline-block; width: 8px; height: 8px; background-color: #6366f1; border-radius: 50%; margin-right: 12px; vertical-align: middle;"></span>`;
        return `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px;">
            <tr>
              <td style="padding: 0;">
                <p style="margin: 0; color: #0f172a; font-size: 15px; line-height: 1.7; font-family: ${FONT_FAMILY};">
                  ${bullet}${String(item)}
                </p>
              </td>
            </tr>
          </table>
        `;
      })
      .join("");
  }
  if (typeof value === "object") {
    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; border-left: 4px solid #8b5cf6; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
        <tr>
          <td style="padding: 20px;">
            ${formatObject(value)}
          </td>
        </tr>
      </table>
    `;
  }
  return String(value);
}

function emailTemplate(fields, filesList) {
  return `
<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Nueva Solicitud PERC</title>
  <style type="text/css">
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    
    @media (prefers-color-scheme: dark) {
      .email-container {
        background-color: #0f172a !important;
      }
      .email-body {
        background-color: #1e293b !important;
        color: #f1f5f9 !important;
      }
    }
    
    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      font-family: ${FONT_FAMILY};
      background-color: #f8fafc;
    }
    
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    
    @media only screen and (max-width: 680px) {
      .email-container {
        padding: 16px 8px !important;
      }
      .header {
        padding: 32px 24px !important;
        border-radius: 12px 12px 0 0 !important;
      }
      .header-title {
        font-size: 26px !important;
      }
      .email-body {
        padding: 32px 24px !important;
        border-radius: 0 0 12px 12px !important;
      }
      .section-title {
        font-size: 18px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="display: none; max-height: 0; overflow: hidden; color: transparent; font-size: 0; line-height: 0;">
    Nueva Solicitud de Apertura de Cuenta - PERC
  </div>
  
  <div class="email-container" style="background-color: #f8fafc; padding: 32px 16px;">
    <div style="max-width: 680px; margin: 0 auto;">
      
      <!-- Header -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 0;">
        <tr>
          <td class="header" style="background: linear-gradient(135deg, rgb(186, 16, 16) 0%, rgb(26, 41, 155) 100%); border-radius: 16px 16px 0 0; padding: 48px 40px; text-align: center;">
            <h1 class="header-title" style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; line-height: 1.2; font-family: ${FONT_FAMILY};">
              Nueva Solicitud PERC
            </h1>
            <p class="header-subtitle" style="margin: 0; font-size: 15px; color: rgba(255, 255, 255, 0.9); font-weight: 400; letter-spacing: 0.2px; font-family: ${FONT_FAMILY};">
              Formulario de Apertura de Cuenta
            </p>
          </td>
        </tr>
      </table>
      
      <!-- Body -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 0;">
        <tr>
          <td class="email-body" style="background-color: #ffffff; border-radius: 0 0 16px 16px; padding: 48px 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            
            <!-- Section Title -->
            <h2 class="section-title" style="margin: 0 0 32px 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0; font-family: ${FONT_FAMILY};">
              Información del Formulario
            </h2>
            
            <!-- Fields Grid -->
            <div class="fields-grid">
              ${fields}
            </div>
            
            <!-- Files List -->
            ${filesList}
            
          </td>
        </tr>
      </table>
      
      <!-- Footer -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 32px;">
        <tr>
          <td style="padding: 0; text-align: center;">
            <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6; font-family: ${FONT_FAMILY};">
              Este email fue generado automáticamente por el sistema PERC.<br>
              <span style="color: #94a3b8; font-size: 12px;">Por favor, no responder a este correo.</span>
            </p>
          </td>
        </tr>
      </table>
      
    </div>
  </div>
</body>
</html>
  `;
}

function generateEmailHTML(formData, files = []) {
  const fields = Object.entries(formData)
    .map(([key, value]) => {
      const label = translateLabel(key);
      const formattedValue = formatValue(value);
      return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px; border-collapse: separate;">
        <tr>
          <td style="padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding: 0 0 12px 0; border-bottom: 1px solid #f1f5f9;">
                  <p style="margin: 0; font-weight: 600; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; font-family: ${FONT_FAMILY};">${label}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 16px 0 0 0;">
                  <div style="color: #0f172a; font-size: 15px; line-height: 1.7; word-wrap: break-word; font-family: ${FONT_FAMILY};">
                    ${formattedValue}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
    })
    .join("");

  const filesList =
    files.length > 0
      ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 48px;">
        <tr>
          <td style="padding: 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
              <tr>
                <td style="padding: 0 0 20px 0; border-bottom: 2px solid #e2e8f0;">
                  <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; font-family: ${FONT_FAMILY};">Archivos Adjuntos</h2>
                  <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px; font-weight: 400; font-family: ${FONT_FAMILY};">${files.length} ${files.length === 1 ? "archivo adjunto" : "archivos adjuntos"}</p>
                </td>
              </tr>
            </table>
            ${files
              .map((file) => {
                const category = file.category || "unknown";
                const originalName = file.name || "document";
                const translatedCategory = translateCategory(category);
                const categoryColors = {
                  balance: { bg: "#3b82f6", text: "#ffffff" },
                  statute: { bg: "#8b5cf6", text: "#ffffff" },
                  designAuthorities: { bg: "#10b981", text: "#ffffff" },
                  dniFront: { bg: "#f59e0b", text: "#ffffff" },
                  dniBack: { bg: "#f59e0b", text: "#ffffff" },
                  unknown: { bg: "#64748b", text: "#ffffff" },
                };
                const categoryColor = categoryColors[category] || categoryColors.unknown;
                return `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px; border-collapse: separate;">
                <tr>
                  <td style="padding: 20px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; border-left: 4px solid ${categoryColor.bg}; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding-right: 16px; vertical-align: middle; width: auto;">
                          <span style="display: inline-block; font-weight: 600; color: ${categoryColor.text}; background-color: ${categoryColor.bg}; padding: 8px 16px; border-radius: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-family: ${FONT_FAMILY};">${translatedCategory}</span>
                        </td>
                        <td style="color: #0f172a; font-size: 15px; vertical-align: middle; font-weight: 500; font-family: ${FONT_FAMILY};">
                          ${originalName}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            `;
              })
              .join("")}
          </td>
        </tr>
      </table>
  `
      : "";

  return emailTemplate(fields, filesList);
}

module.exports = {
  generateEmailHTML,
};

