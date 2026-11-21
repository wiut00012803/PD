import { z } from "zod";

export const LANGS = ["ru", "uz", "en"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABELS: Record<Lang, string> = { ru: "RU · Русский", uz: "UZ · Oʻzbekcha", en: "EN · English" };

export const ICONS = {
  "shield-check": "Щит с галочкой — защита, уголовные дела",
  scale: "Весы — суд, гражданские дела",
  gavel: "Молоток судьи — судебные процессы",
  briefcase: "Портфель — бизнес",
  receipt: "Чек — налоги",
  coins: "Монеты — долги, деньги",
  banknote: "Купюра — платежи, банки",
  "building-2": "Здание — недвижимость, компании",
  house: "Дом — жильё, семья",
  "key-round": "Ключ — сделки с жильём",
  landmark: "Госучреждение — споры с госорганами",
  users: "Люди — семья, команда",
  "heart-handshake": "Рукопожатие с сердцем — семейные дела",
  baby: "Ребёнок — дети, алименты",
  handshake: "Рукопожатие — сделки, медиация",
  "hard-hat": "Каска — трудовые споры",
  car: "Автомобиль — ДТП",
  globe: "Глобус — миграция, гражданство",
  "scroll-text": "Свиток — наследство, завещания",
  "file-text": "Документ — заявления, жалобы",
  "file-search": "Лупа над документом — проверка документов",
  lock: "Замок — конфиденциальность",
  award: "Медаль — опыт, профессионализм",
  target: "Мишень — результат",
  clock: "Часы — сроки",
  "message-circle": "Облако сообщения — связь",
  phone: "Телефон — звонок",
  shield: "Щит — безопасность",
  check: "Галочка",
} as const;
export type IconName = keyof typeof ICONS;

export const SOCIALS = {
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  x: "X (Twitter)",
  tiktok: "TikTok",
} as const;
export type SocialName = keyof typeof SOCIALS;

export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];

const PATTERNS = {
  phone: { regex: /^\+998 \d{2} \d{3}-\d{2}-\d{2}$/, message: "Телефон в формате +998 90 123-45-67" },
  email: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message: "Email в формате name@example.uz" },
  telegram: { regex: /^[A-Za-z][A-Za-z0-9_]{4,31}$/, message: "Имя пользователя Telegram без @ и без ссылки, например pravoedelo" },
  whatsapp: { regex: /^998\d{9}$/, message: "Номер WhatsApp только цифрами, начиная с 998, например 998901234567" },
  form: { regex: /^https:\/\/(forms\.gle\/|docs\.google\.com\/forms\/)\S+$/, message: "Ссылка на Google Форму: https://forms.gle/… или https://docs.google.com/forms/…" },
  url: { regex: /^https:\/\/\S+\.\S+$/, message: "Полная ссылка, начинается с https://" },
  image: { regex: new RegExp(`\\.(${IMAGE_EXTENSIONS.join("|")})$`, "i"), message: "Нужна картинка в формате JPG, PNG, WebP или AVIF" },
} as const;

export interface FieldMeta {
  label: string;
  description?: string;
  multiline?: boolean;
  i18n?: boolean;
  image?: boolean;
  itemLabel?: string;
  summary?: string;
  cmsPattern?: { regex: string; message: string };
  choices?: Record<string, string>;
  [key: string]: unknown;
}

const toText = (v: unknown) => (v === null || v === undefined ? "" : typeof v === "number" || typeof v === "boolean" ? String(v) : v);
const orEmptyObject = (v: unknown) => (v === null || v === undefined ? {} : v);
const orEmptyList = (v: unknown) => (v === null || v === undefined ? [] : v);
const orUndefined = (v: unknown) => (v === null || v === "" ? undefined : v);

interface StrOptions {
  required?: boolean;
  max?: number;
  pattern?: { regex: RegExp; message: string };
  multiline?: boolean;
  description?: string;
}

function plain(label: string, o: StrOptions = {}) {
  const required = o.required !== false;
  let s = z.string().trim();
  if (required) s = s.min(1);
  if (o.max) s = s.max(o.max);
  const pattern = o.pattern;
  const checked = pattern
    ? s.refine((v) => v === "" || pattern.regex.test(v), { error: pattern.message })
    : s;
  const meta: FieldMeta = { label, description: o.description, multiline: o.multiline };
  if (pattern) meta.cmsPattern = { regex: pattern.regex.source, message: pattern.message };
  return z.preprocess(toText, checked).meta(meta);
}

interface TextOptions {
  required?: boolean;
  max?: number;
  multiline?: boolean;
  description?: string;
}

function text(label: string, o: TextOptions = {}) {
  const part = (lang: Lang, required: boolean) =>
    plain(LANG_LABELS[lang], { required, max: o.max, multiline: o.multiline });
  const shape = z.object({
    ru: part("ru", o.required !== false),
    uz: part("uz", false),
    en: part("en", false),
  });
  return z.preprocess(orEmptyObject, shape).meta({ label, description: o.description, i18n: true, multiline: o.multiline });
}

function int(label: string, o: { min: number; max: number; fallback: number; description?: string }) {
  return z
    .preprocess((v) => (v === null || v === "" || v === undefined ? undefined : typeof v === "string" ? Number(v) : v), z.number().int().min(o.min).max(o.max).default(o.fallback))
    .meta({ label, description: o.description });
}

function flag(label: string, description?: string) {
  return z.preprocess(orUndefined, z.boolean().default(true)).meta({ label, description });
}

function choice<T extends Record<string, string>>(label: string, choices: T, description?: string) {
  const keys = Object.keys(choices) as [keyof T & string, ...(keyof T & string)[]];
  return z.enum(keys).meta({ label, description, choices });
}

function image(label: string, o: { required?: boolean; description?: string; exists: (path: string) => boolean }) {
  const required = o.required !== false;
  let s = z.string().trim();
  if (required) s = s.min(1);
  const checked = s
    .refine((v) => v === "" || PATTERNS.image.regex.test(v), { error: PATTERNS.image.message })
    .refine((v) => v === "" || !PATTERNS.image.regex.test(v) || o.exists(v), { error: "Файл не найден в медиатеке — загрузите фото ещё раз" });
  return z.preprocess(toText, checked).meta({ label, description: o.description, image: true });
}

function list<T extends z.ZodType>(label: string, item: T, o: { min?: number; max: number; itemLabel: string; summary?: string; description?: string }) {
  let arr = z.array(item).max(o.max);
  if (o.min) arr = arr.min(o.min);
  return z.preprocess(orEmptyList, arr).meta({ label, description: o.description, itemLabel: o.itemLabel, summary: o.summary });
}

function group<T extends z.ZodRawShape>(label: string, shape: T, description?: string) {
  return z.preprocess(orEmptyObject, z.object(shape)).meta({ label, description });
}

const icon = (label = "Иконка") => choice(label, ICONS);
const enabled = (what: string) => flag("Показывать на сайте", `Выключите, чтобы скрыть ${what}`);
const TITLE_HINT = "Перенос строки (Enter) сохраняется на больших экранах";

export interface SchemaContext {
  imageExists: (path: string) => boolean;
}

export function createSchemas(ctx: SchemaContext) {
  const photo = (label: string, required: boolean, description?: string) => image(label, { required, description, exists: ctx.imageExists });

  const sectionHead = {
    overline: text("Надзаголовок", { max: 40, description: "Мелкая строка над заголовком секции" }),
    title: text("Заголовок", { max: 70 }),
    subtitle: text("Подзаголовок", { max: 260, multiline: true, required: false }),
  };

  const faqItems = list(
    "Вопросы",
    z.object({
      question: text("Вопрос", { max: 140 }),
      answer: text("Ответ", { max: 1200, multiline: true }),
    }),
    { min: 1, max: 20, itemLabel: "Вопрос", summary: "{fields.question.ru}" },
  );

  const settings = z.object({
    siteName: plain("Название фирмы", { max: 40 }),
    phone: plain("Телефон", { pattern: PATTERNS.phone }),
    email: plain("Email", { pattern: PATTERNS.email }),
    telegram: plain("Telegram", { pattern: PATTERNS.telegram, description: "Имя пользователя без @. Кнопки Telegram откроют https://t.me/имя" }),
    whatsapp: plain("WhatsApp", { pattern: PATTERNS.whatsapp, description: "Номер только цифрами. Кнопки WhatsApp откроют чат с этим номером" }),
    formUrl: plain("Ссылка на Google Форму заявки", { pattern: PATTERNS.form, description: "Куда ведут кнопки «Заполнить заявку» и «Записаться на консультацию»" }),
    address: text("Адрес", { max: 140 }),
    hours: text("Часы работы", { max: 90 }),
    mapQuery: plain("Адрес для карты", { max: 200, description: "Как найти офис в Google Maps: адрес или название. Карта на сайте покажет эту точку" }),
    practiceSince: int("Год начала адвокатской практики", { min: 1950, max: 2100, fallback: 2008, description: "Из него считается стаж. В текстах пишите {years} — число лет, {yearsWord} — слово «лет/год/года»" }),
    founded: int("Год основания бюро", { min: 1950, max: 2100, fallback: 2018 }),
    socials: list(
      "Соцсети",
      z.object({ network: choice("Соцсеть", SOCIALS), url: plain("Ссылка", { pattern: PATTERNS.url }) }),
      { max: 7, itemLabel: "Соцсеть", summary: "{fields.network}", description: "Иконки в подвале сайта" },
    ),
    privacyUrl: plain("Ссылка на политику конфиденциальности", { required: false, pattern: PATTERNS.url, description: "Если пусто — ссылка в подвале не показывается" }),
    seo: group("Поисковики и соцсети", {
      title: text("Заголовок вкладки и поисковой выдачи", { max: 70 }),
      description: text("Описание для поисковой выдачи", { max: 180, multiline: true }),
    }),
  });

  const home = z.object({
    hero: group("Первый экран", {
      badge: text("Бейдж над заголовком", { max: 50 }),
      title: text("Заголовок", { max: 40, description: TITLE_HINT }),
      titleAccent: text("Заголовок — выделенная часть", { max: 40, description: "Вторая строка заголовка с золотым градиентом" }),
      subtitle: text("Подзаголовок", { max: 220, multiline: true }),
      button: text("Текст главной кнопки", { max: 32, description: "Кнопка ведёт на страницу консультации" }),
    }),
    stats: group("Цифры", {
      enabled: enabled("цифры под первым экраном"),
      items: list(
        "Цифры",
        z.object({
          value: text("Число", { max: 12, description: "Например: 1 200+ или {years}" }),
          caption: text("Подпись", { max: 40 }),
          captionShort: text("Короткая подпись для телефона", { max: 24, required: false }),
        }),
        { min: 2, max: 8, itemLabel: "Цифра", summary: "{fields.value.ru} {fields.caption.ru}" },
      ),
    }),
    about: group("О нас", {
      enabled: enabled("секцию «О нас»"),
      overline: text("Надзаголовок", { max: 40 }),
      title: text("Заголовок", { max: 70, description: TITLE_HINT }),
      lead: text("Первый абзац", { max: 500, multiline: true }),
      text: text("Второй абзац", { max: 500, multiline: true, required: false }),
      badges: list("Бейджи", text("Бейдж", { max: 40 }), { max: 6, itemLabel: "Бейдж", summary: "{fields.ru}" }),
      photo: photo("Фото", true, "Горизонтальное или квадратное фото, от 1200 px по ширине"),
      photoAlt: text("Описание фото для незрячих и поисковиков", { max: 140 }),
      photoCaption: text("Подпись на фото", { max: 60, required: false }),
      photoNote: text("Вторая строка подписи", { max: 60, required: false }),
    }),
    advantages: group("Преимущества", {
      enabled: enabled("три карточки преимуществ"),
      items: list(
        "Карточки",
        z.object({ icon: icon(), title: text("Заголовок", { max: 40 }), text: text("Текст", { max: 240, multiline: true }) }),
        { min: 1, max: 6, itemLabel: "Карточка", summary: "{fields.title.ru}" },
      ),
    }),
    consult: group("Блок «Бесплатная консультация»", {
      enabled: enabled("блок с приглашением на консультацию"),
      badge: text("Бейдж", { max: 50 }),
      title: text("Заголовок", { max: 50 }),
      titleAccent: text("Заголовок — выделенная часть", { max: 40 }),
      text: text("Текст", { max: 300, multiline: true }),
      button: text("Кнопка заявки", { max: 36, description: "Ведёт на Google Форму" }),
      link: text("Ссылка на страницу консультации", { max: 40 }),
      steps: list(
        "Шаги",
        z.object({ title: text("Шаг", { max: 40 }), text: text("Пояснение", { max: 90 }) }),
        { min: 1, max: 6, itemLabel: "Шаг", summary: "{fields.title.ru}" },
      ),
    }),
    contacts: group("Контакты", {
      enabled: enabled("секцию контактов с картой"),
      overline: text("Надзаголовок", { max: 40 }),
      title: text("Заголовок", { max: 70 }),
    }),
  });

  const services = z.object({
    enabled: enabled("секцию услуг"),
    ...sectionHead,
    general: group("Общие услуги", {
      title: text("Заголовок", { max: 60 }),
      items: list("Услуги", text("Услуга", { max: 160 }), { max: 12, itemLabel: "Услуга", summary: "{fields.ru}" }),
    }, "Строка над карточками: то, что входит в любое направление"),
    practices: list(
      "Направления (карточки)",
      z.object({
        icon: icon(),
        title: text("Название", { max: 40 }),
        short: text("Коротко — для телефона", { max: 60 }),
        description: text("Описание на карточке", { max: 200, multiline: true }),
        items: list("Услуги направления", text("Услуга", { max: 200 }), { max: 80, itemLabel: "Услуга", summary: "{fields.ru}", description: "Полный список открывается по кнопке «Подробнее»" }),
      }),
      { min: 1, max: 12, itemLabel: "Направление", summary: "{fields.title.ru}" },
    ),
    cta: group("Плашка под карточками", {
      title: text("Заголовок", { max: 50 }),
      text: text("Текст", { max: 160, multiline: true }),
    }),
  });

  const cases = z.object({
    enabled: enabled("секцию кейсов"),
    ...sectionHead,
    visible: int("Сколько кейсов видно сразу", { min: 1, max: 30, fallback: 4, description: "Остальные открываются кнопкой «Показать ещё»" }),
    items: list(
      "Кейсы",
      z.object({
        category: text("Категория", { max: 40 }),
        title: text("Заголовок", { max: 60 }),
        situation: text("Ситуация", { max: 320, multiline: true }),
        result: text("Результат", { max: 320, multiline: true }),
      }),
      { max: 30, itemLabel: "Кейс", summary: "{fields.title.ru}" },
    ),
  });

  const team = z.object({
    enabled: enabled("секцию команды"),
    ...sectionHead,
    members: list(
      "Юристы",
      z.object({
        photo: photo("Фото", false, "Вертикальное фото, лицо в верхней трети кадра. Если пусто — будет аккуратная заглушка"),
        name: text("Имя", { max: 60 }),
        role: text("Должность", { max: 50 }),
        bio: text("Коротко о юристе", { max: 260, multiline: true }),
        bioFull: text("Полная биография", { max: 5000, multiline: true, required: false, description: "Если заполнено — на карточке появится кнопка «Подробнее»" }),
      }),
      { min: 1, max: 20, itemLabel: "Юрист", summary: "{fields.name.ru}" },
    ),
  });

  const reviews = z.object({
    enabled: enabled("секцию отзывов"),
    ...sectionHead,
    visible: int("Сколько отзывов видно сразу", { min: 1, max: 40, fallback: 3 }),
    items: list(
      "Отзывы",
      z.object({
        text: text("Отзыв", { max: 420, multiline: true }),
        name: text("Имя клиента", { max: 50 }),
        company: text("Должность или компания", { max: 60, required: false }),
      }),
      { max: 40, itemLabel: "Отзыв", summary: "{fields.name.ru}" },
    ),
    clients: group("Логотипы клиентов", {
      title: text("Подпись", { max: 40 }),
      items: list(
        "Клиенты",
        z.object({ name: plain("Название", { max: 40 }), logo: photo("Логотип", false, "PNG или WebP на прозрачном фоне") }),
        { max: 20, itemLabel: "Клиент", summary: "{fields.name}" },
      ),
    }),
  });

  const faq = z.object({
    enabled: enabled("секцию FAQ"),
    ...sectionHead,
    items: faqItems,
  });

  const consultation = z.object({
    seo: group("Поисковики и соцсети", {
      title: text("Заголовок вкладки", { max: 70 }),
      description: text("Описание для поисковой выдачи", { max: 180, multiline: true }),
    }),
    hero: group("Первый экран", {
      badge: text("Бейдж", { max: 50 }),
      title: text("Заголовок", { max: 30 }),
      titleAccent: text("Заголовок — выделенная часть", { max: 30 }),
      subtitle: text("Подзаголовок", { max: 240, multiline: true }),
      button: text("Кнопка заявки", { max: 32, description: "Ведёт на Google Форму" }),
      getTitle: text("Заголовок карточки «Что вы получите»", { max: 40 }),
      get: list("Что вы получите", text("Пункт", { max: 80 }), { min: 1, max: 6, itemLabel: "Пункт", summary: "{fields.ru}" }),
      confidential: text("Строка про конфиденциальность", { max: 60 }),
    }),
    steps: group("Как проходит", {
      enabled: enabled("шаги консультации"),
      ...sectionHead,
      items: list(
        "Шаги",
        z.object({ icon: icon(), title: text("Шаг", { max: 40 }), text: text("Описание", { max: 160, multiline: true }), time: text("Сколько занимает", { max: 30 }) }),
        { min: 1, max: 6, itemLabel: "Шаг", summary: "{fields.title.ru}" },
      ),
      terms: list(
        "Условия",
        z.object({ icon: icon(), title: text("Заголовок", { max: 40 }), text: text("Текст", { max: 200, multiline: true }) }),
        { max: 6, itemLabel: "Условие", summary: "{fields.title.ru}" },
      ),
    }),
    topics: group("С какими вопросами обращаться", {
      enabled: enabled("список тем"),
      overline: text("Надзаголовок", { max: 40 }),
      title: text("Заголовок", { max: 70 }),
      items: list("Темы", z.object({ icon: icon(), label: text("Тема", { max: 50 }) }), { max: 30, itemLabel: "Тема", summary: "{fields.label.ru}" }),
    }),
    faq: group("Вопросы о консультации", {
      enabled: enabled("FAQ консультации"),
      ...sectionHead,
      items: faqItems,
    }),
    final: group("Финальный призыв", {
      enabled: enabled("финальный блок"),
      title: text("Заголовок", { max: 50 }),
      titleAccent: text("Заголовок — выделенная часть", { max: 40 }),
      subtitle: text("Подзаголовок", { max: 120 }),
    }),
  });

  const ui = z.object({
    nav: group("Меню", {
      services: text("Услуги", { max: 20 }),
      about: text("О нас", { max: 20 }),
      cases: text("Кейсы", { max: 20 }),
      team: text("Команда", { max: 20 }),
      reviews: text("Отзывы", { max: 20 }),
      faq: text("FAQ", { max: 20 }),
      contacts: text("Контакты", { max: 20 }),
      consultation: text("Бесплатная консультация", { max: 40 }),
    }),
    buttons: group("Кнопки", {
      consultShort: text("Кнопка в шапке", { max: 18 }),
      more: text("Подробнее", { max: 20 }),
      showMore: text("Показать ещё", { max: 24 }),
      back: text("На главную", { max: 24 }),
      allPractices: text("Все направления", { max: 40 }),
      openMap: text("Открыть карту", { max: 30 }),
      close: text("Закрыть", { max: 20 }),
      menu: text("Меню", { max: 20 }),
      call: text("Позвонить", { max: 20 }),
    }),
    labels: group("Подписи", {
      address: text("Адрес", { max: 20 }),
      phone: text("Телефон", { max: 20 }),
      email: text("Email", { max: 20 }),
      hours: text("Часы работы", { max: 20 }),
      situation: text("Ситуация", { max: 20 }),
      result: text("Результат", { max: 20 }),
      practiceList: text("Заголовок списка услуг в окне направления", { max: 40 }),
      dialogCta: text("Призыв в окне направления", { max: 120 }),
      themeLight: text("Подсказка: включить светлую тему", { max: 40 }),
      themeDark: text("Подсказка: включить тёмную тему", { max: 40 }),
      language: text("Подсказка: язык", { max: 20 }),
      skip: text("Ссылка «к содержанию» для клавиатуры", { max: 40 }),
      photoSoon: text("Подпись вместо фото юриста", { max: 40 }),
    }),
    footer: group("Подвал", {
      tagline: text("Описание под логотипом", { max: 140, multiline: true }),
      sections: text("Колонка «Разделы»", { max: 20 }),
      clients: text("Колонка «Клиентам»", { max: 20 }),
      contact: text("Колонка «Связь»", { max: 20 }),
      privacy: text("Политика конфиденциальности", { max: 40 }),
      rights: text("Все права защищены", { max: 60 }),
    }),
    notFound: group("Страница 404", {
      title: text("Заголовок", { max: 50 }),
      text: text("Текст", { max: 160 }),
    }),
  });

  return { settings, home, services, cases, team, reviews, faq, consultation, ui };
}

export type Schemas = ReturnType<typeof createSchemas>;
export type ContentKey = keyof Schemas;
export type SiteContent = { [K in ContentKey]: z.output<Schemas[K]> };
export type LocalizedText = { ru: string; uz: string; en: string };

export const CONTENT_FILES: Record<ContentKey, { file: string; label: string; description: string }> = {
  settings: { file: "settings.yaml", label: "Контакты и ссылки", description: "Телефон, мессенджеры, адрес, ссылка на форму заявки, соцсети, стаж" },
  home: { file: "home.yaml", label: "Главная", description: "Первый экран, цифры, «О нас», преимущества, блок консультации, контакты" },
  services: { file: "services.yaml", label: "Услуги", description: "Направления практики и полные списки услуг" },
  cases: { file: "cases.yaml", label: "Кейсы", description: "Успешные дела без имён клиентов" },
  team: { file: "team.yaml", label: "Команда", description: "Юристы: фото, должность, биография" },
  reviews: { file: "reviews.yaml", label: "Отзывы", description: "Отзывы клиентов и логотипы компаний" },
  faq: { file: "faq.yaml", label: "FAQ", description: "Частые вопросы на главной" },
  consultation: { file: "consultation.yaml", label: "Страница консультации", description: "Всё содержимое страницы «Бесплатная консультация»" },
  ui: { file: "ui.yaml", label: "Подписи интерфейса", description: "Меню, кнопки, подписи, подвал, страница 404" },
};
