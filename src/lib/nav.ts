import type { SiteContent } from "../content/schema.ts";
import { getContent } from "./content.ts";
import { tr, url } from "./i18n.ts";
import type { Lang, PageKey } from "./i18n.ts";

export function sectionVisibility(c: SiteContent = getContent()) {
  return {
    services: c.services.enabled && c.services.practices.length > 0,
    about: c.home.about.enabled,
    cases: c.cases.enabled && c.cases.items.length > 0,
    team: c.team.enabled && c.team.members.length > 0,
    reviews: c.reviews.enabled && c.reviews.items.length > 0,
    faq: c.faq.enabled && c.faq.items.length > 0,
    contacts: c.home.contacts.enabled,
  };
}

type SectionId = keyof ReturnType<typeof sectionVisibility>;

const SECTIONS: { id: SectionId; inHeader: boolean; compactHidden: boolean; footer: "sections" | "clients" }[] = [
  { id: "services", inHeader: true, compactHidden: false, footer: "sections" },
  { id: "about", inHeader: true, compactHidden: true, footer: "sections" },
  { id: "cases", inHeader: true, compactHidden: false, footer: "sections" },
  { id: "team", inHeader: true, compactHidden: false, footer: "sections" },
  { id: "reviews", inHeader: false, compactHidden: false, footer: "clients" },
  { id: "faq", inHeader: false, compactHidden: false, footer: "sections" },
  { id: "contacts", inHeader: true, compactHidden: false, footer: "clients" },
];

export interface NavLink {
  id: SectionId;
  label: string;
  href: string;
  inHeader: boolean;
  compactHidden: boolean;
  footer: "sections" | "clients";
}

export function navLinks(lang: Lang, page: PageKey): NavLink[] {
  const c = getContent();
  const visible = sectionVisibility(c);
  return SECTIONS.filter((s) => visible[s.id]).map((s) => ({
    ...s,
    label: tr(c.ui.nav[s.id], lang),
    href: page === "home" ? `#${s.id}` : url(lang, "home", s.id),
  }));
}
