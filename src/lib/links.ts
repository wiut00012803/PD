import { getContent } from "./content.ts";

export function contactLinks() {
  const { settings } = getContent();
  const phoneDigits = settings.phone.replace(/[^\d+]/g, "");
  return {
    telegram: `https://t.me/${settings.telegram}`,
    whatsapp: `https://wa.me/${settings.whatsapp}`,
    phone: `tel:${phoneDigits}`,
    phoneDisplay: settings.phone.replace(/ /g, " "),
    email: `mailto:${settings.email}`,
    form: settings.formUrl,
    map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.mapQuery)}`,
    mapEmbed: `https://www.google.com/maps?q=${encodeURIComponent(settings.mapQuery)}&output=embed`,
  };
}
