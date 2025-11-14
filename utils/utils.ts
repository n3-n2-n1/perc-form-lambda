import { STYLES, LABEL_TRANSLATIONS, CATEGORY_TRANSLATIONS } from "./constants";
import emailTemplate from "../src/email/template";

export const htmlTag = (
  tag: string,
  content: string,
  attrs: Record<string, string> = {}
) => {
  const attrStr = Object.entries(attrs)
    .map(([key, val]) => `${key}="${val}"`)
    .join(" ");
  return `<${tag}${attrStr ? ` ${attrStr}` : ""}>${content}</${tag}>`;
};

const span = (content: string, style: string) =>
  htmlTag("span", content, { style });

const p = (content: string, style: string) => htmlTag("p", content, { style });

const td = (content: string, style: string) =>
  htmlTag("td", content, { style });

const tr = (content: string) => htmlTag("tr", content);

const table = (content: string, style: string) =>
  htmlTag("table", content, {
    role: "presentation",
    width: "100%",
    cellpadding: "0",
    cellspacing: "0",
    border: "0",
    style,
  });

const placeholderText = () =>
  span(
    "No especificado",
    `color: ${STYLES.colors.textPlaceholder}; font-style: italic; font-family: ${STYLES.fontFamily};`
  );

const badge = (text: string, color: string) =>
  span(
    text,
    `display: inline-block; padding: 6px 14px; background-color: ${color}; color: #ffffff; border-radius: 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; font-family: ${STYLES.fontFamily};`
  );

const labelText = (text: string) =>
  p(
    text,
    `margin: 0 0 6px 0; color: ${STYLES.colors.textMuted}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-family: ${STYLES.fontFamily};`
  );

const valueText = (content: string) =>
  p(
    content,
    `margin: 0; color: ${STYLES.colors.text}; font-size: 15px; line-height: 1.7; font-family: ${STYLES.fontFamily};`
  );

const fieldRow = (label: string, value: string) =>
  table(
    tr(td(labelText(label) + valueText(value), "padding: 0;")),
    `margin-bottom: 16px;`
  );

const card = (content: string, borderColor: string) =>
  table(
    tr(
      td(
        content,
        `padding: 20px; background-color: ${STYLES.colors.backgroundLight}; border: 1px solid ${STYLES.colors.border}; border-radius: 12px; border-left: 4px solid ${borderColor}; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);`
      )
    ),
    `margin-bottom: 16px; border-collapse: separate;`
  );

export const translateLabel = (key: string): string => {
  const normalizedKey = key.trim().toLowerCase();

  // Buscar coincidencia exacta o case-insensitive
  const found = Object.entries(LABEL_TRANSLATIONS).find(
    ([k]) =>
      k.toLowerCase() === normalizedKey ||
      k.toLowerCase() === normalizedKey.replace(/\s+/g, "")
  );

  if (found) return found[1];

  // Fallback: convertir camelCase a formato legible
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export const translateCategory = (category: string): string => {
  return CATEGORY_TRANSLATIONS[category] || category;
};

const formatPrimitive = (value: unknown): string => {
  if (value === null || value === undefined) {
    return placeholderText();
  }

  if (typeof value === "boolean") {
    const color = value ? STYLES.colors.badgeSuccess : STYLES.colors.badgeError;
    return badge(value ? "SI" : "NO", color);
  }

  return span(
    String(value),
    `color: ${STYLES.colors.text}; font-family: ${STYLES.fontFamily};`
  );
};

export const formatObject = (obj: Record<string, unknown>): string => {
  const entries = Object.entries(obj)
    .map(([key, val]) => {
      const label = translateLabel(key);

      let formattedVal: string;
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        formattedVal = formatObject(val as Record<string, unknown>);
      } else {
        formattedVal = formatPrimitive(val);
      }

      return fieldRow(label, formattedVal);
    })
    .join("");

  return entries || placeholderText();
};

export const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return placeholderText();
  }

  if (typeof value === "boolean") {
    const color = value ? STYLES.colors.badgeSuccess : STYLES.colors.badgeError;
    return badge(value ? "SI" : "NO", color);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return placeholderText();
    }

    return value
      .map((item, index) => {
        if (typeof item === "object" && item !== null) {
          const header = p(
            `Registro ${index + 1}`,
            `margin: 0; color: ${STYLES.colors.accentBlue}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; font-family: ${STYLES.fontFamily};`
          );

          const content = table(
            tr(
              td(
                header,
                `padding: 0 0 14px 0; border-bottom: 1px solid ${STYLES.colors.border};`
              )
            ) + tr(td(formatObject(item), "padding: 16px 0 0 0;")),
            `width: 100%;`
          );

          return card(content, STYLES.colors.accentBlue);
        }

        const bullet = span(
          "",
          `display: inline-block; width: 8px; height: 8px; background-color: ${STYLES.colors.accentBlue}; border-radius: 50%; margin-right: 12px; vertical-align: middle;`
        );

        return table(
          tr(td(valueText(bullet + String(item)), "padding: 0;")),
          `margin-bottom: 10px;`
        );
      })
      .join("");
  }

  if (typeof value === "object") {
    return card(
      formatObject(value as Record<string, unknown>),
      STYLES.colors.accentPurple
    );
  }

  return String(value);
};

export const generateEmailHTML = (
  formData: Record<string, unknown>,
  files: Array<{ name: string; category: string }>
): string => {
  const fields = Object.entries(formData)
    .map(([key, value]) => {
      const label = translateLabel(key);
      const formattedValue = formatValue(value);
      return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px; border-collapse: separate;">
        <tr>
          <td style="padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1); transition: all 0.2s ease;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding: 0 0 12px 0; border-bottom: 1px solid #f1f5f9;">
                  <p style="margin: 0; font-weight: 600; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">${label}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 16px 0 0 0;">
                  <div style="color: #0f172a; font-size: 15px; line-height: 1.7; word-wrap: break-word; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">
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
                  <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">Archivos Adjuntos</h2>
                  <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px; font-weight: 400; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">${files.length} ${files.length === 1 ? "archivo adjunto" : "archivos adjuntos"}</p>
                </td>
              </tr>
            </table>
            ${files
              .map((file) => {
                const category = file.category || "unknown";
                const originalName = file.name || "document";
                const translatedCategory = translateCategory(category);
                const categoryColors: Record<
                  string,
                  { bg: string; text: string }
                > = {
                  balance: { bg: "#3b82f6", text: "#ffffff" },
                  statute: { bg: "#8b5cf6", text: "#ffffff" },
                  designAuthorities: { bg: "#10b981", text: "#ffffff" },
                  dniFront: { bg: "#f59e0b", text: "#ffffff" },
                  dniBack: { bg: "#f59e0b", text: "#ffffff" },
                  unknown: { bg: "#64748b", text: "#ffffff" },
                };
                const categoryColor =
                  categoryColors[category] || categoryColors.unknown;
                return `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px; border-collapse: separate;">
                <tr>
                  <td style="padding: 20px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; border-left: 4px solid ${categoryColor.bg}; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding-right: 16px; vertical-align: middle; width: auto;">
                          <span style="display: inline-block; font-weight: 600; color: ${categoryColor.text}; background-color: ${categoryColor.bg}; padding: 8px 16px; border-radius: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">${translatedCategory}</span>
                        </td>
                        <td style="color: #0f172a; font-size: 15px; vertical-align: middle; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">
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
};
