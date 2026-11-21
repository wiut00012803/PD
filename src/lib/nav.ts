import { getContent } from "./content.ts";
import { tr, url } from "./i18n.ts";
import type { Lang, PageKey } from "./i18n.ts";

export interface NavLink {
  id: string;
  label: string;
  href: string;
  inHeader: boolean;
  compactHidden: boolean;
}

export function navLinks(lang: Lang, page: PageKey): NavLink[] {
  const c = getContent();
  const anchor = (id: string) => (page === "home" ? `#${id}` : url(lang, "home", id));
  const all: (NavLink & { visible: boolean })[] = [
    { id: "services", label: tr(c.ui.nav.services, lang), href: anchor("services"), inHeader: true, compactHidden: false, visible: c.services.enabled },
    { id: "about", label: tr(c.ui.nav.about, lang), href: anchor("about"), inHeader: true, compactHidden: true, visible: c.home.about.enabled },
    { id: "cases", label: tr(c.ui.nav.cases, lang), href: anchor("cases"), inHeader: true, compactHidden: false, visible: c.cases.enabled && c.cases.items.length > 0 },
    { id: "team", label: tr(c.ui.nav.team, lang), href: anchor("team"), inHeader: true, compactHidden: false, visible: c.team.enabled },
    { id: "reviews", label: tr(c.ui.nav.reviews, lang), href: anchor("reviews"), inHeader: false, compactHidden: false, visible: c.reviews.enabled && c.reviews.items.length > 0 },
    { id: "faq", label: tr(c.ui.nav.faq, lang), href: anchor("faq"), inHeader: false, compactHidden: false, visible: c.faq.enabled },
    { id: "contacts", label: tr(c.ui.nav.contacts, lang), href: anchor("contacts"), inHeader: true, compactHidden: false, visible: c.home.contacts.enabled },
  ];
  return all.filter((l) => l.visible).map(({ visible: _visible, ...l }) => l);
}
