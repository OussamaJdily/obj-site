// Shape of all site content. en.ts and fr.ts must both satisfy `Dict`,
// so TypeScript flags any text that is missing in one of the languages.

export type ServiceSlug = 'seo' | 'geo' | 'websites' | 'online-shops' | 'conversion-optimization';
export type HubSlug = 'visibility' | 'conversion';
export type ProjectSlug = 'orbit' | 'atlas-bois' | 'lingua-lab' | 'lumen-photo' | 'dar-events';
export type Topic = 'visibility' | 'conversion' | 'strategy';

/** [heading lines, body text, node labels, index of the step after the "click", optional link [path, label]] */
export type Rail = { h: string[]; text: string; steps: string[]; clickAt: number; link?: [string, string] };
export type Statement = { h: string[]; note?: string; strong?: string };
export type Crosslink = { h: string; text: string; href: string; label: string };

export type Service = {
  title: string;
  parent: HubSlug;
  h: string[];
  lead: string;
  visual: 'search' | 'ai' | 'browser';
  visualWord: string;
  tint?: string;
  systemLabel: string;
  statement: Statement;
  factors: { label: string; h: string[]; items: [string, string][] };
  pillars: { label: string; h: string[]; items: [string, string, string, string][] };
  work: { h: string; lead: string; chips: string[] };
  rail: Rail;
  split: { h: string[]; p: string; strong: string };
  cross: Crosslink;
  projects: ProjectSlug[];
  cta: string[];
};

export type Hub = {
  title: string;
  crumb: string;
  h: string[];
  lead: string;
  facts: string[];
  statement: Statement;
  solutionsTitle: string;
  subs: { slug: ServiceSlug; name: string; sub: string; text: string; chips: string[] }[];
  rail: Rail;
  projects: ProjectSlug[];
};

export type Project = {
  slug: ProjectSlug;
  name: string;
  title: string;
  city: string;
  industry: string;
  kind: string;
  tags: string;
  tint: string;
  services: string[];
  intro: string[];
  timeline: [string, string][];
  statement: string[];
  built: [string, string][];
  quote: [string, string];
  metrics: [number, string, string, string][]; // value, suffix, prefix, label
  credits: [string, string][];
};

export type Insight = {
  slug: string;
  topic: Topic;
  title: string;
  word: string;
  tint: string;
  date: string;
  read: number;
  excerpt: string;
  sections: [string, string][]; // heading, trusted HTML
};

export type Dict = {
  locale: 'fr' | 'en';
  meta: { title: string; description: string };
  nav: {
    skip: string; solutions: string; projects: string; agency: string; insights: string; contact: string; home: string;
    menu: string; openMenu: string; closeMenu: string; beforeClick: string; afterClick: string; beforeBuild: string;
    visibility: string; conversion: string; strategy: string; checkPotential: string; switchTo: string;
    services: Record<ServiceSlug, string>;
  };
  common: {
    learnMore: string; allProjects: string; viewCase: string; viewProjects: string; talkDirect: string; startCheck: string;
    latestCase: string; selectedCases: string; projectsTitle: string; nextProject: string; minRead: string; keepReading: string;
    moreArticles: string; contents: string; soundOn: string; soundOff: string; dragRotate: string; studio: string; phone: string;
    email: string; address: string; localTime: string; clients: string; contactLabel: string; contactTitle: string; solutions: string;
    legalNotice: string; privacy: string; beforeTheClick: string; afterTheClick: string; notSureYet: string; firstStep: string;
    exampleFigures: string; potentialCustomer: string; customer: string; awards: [string, string]; howWeWork: string;
    possibleWork: string; theSystem: string; improveVisibility: string; improveConversion: string; client: string;
    industry: string; location: string; servicesLabel: string; bottleneck: string; whatHappened: string; deliverables: string;
    whatWeBuilt: string; outcome: string; whatChanged: string; yourProject: string; topics: Record<Topic | 'all', string>;
    rights: string; tagline: string; studioOf: string;
  };
  process: { h: string[]; steps: [string, string][] };
  losing: string[];
  home: {
    label: string; h1: [string, string, string, string]; lead: string; drift: [string, string];
    fork: { left: string[]; right: string[] }; journey: { h: string[]; lead: string; labels: [string, string]; steps: string[] };
    solutionsH: string[]; clientsH: string[]; stance: { text: string; mute: number }[];
    panel: { h: string[]; flow: string[]; btn: string }; agencyLead: string; meet: string;
  };
  hubs: Record<HubSlug, Hub>;
  services: Record<ServiceSlug, Service>;
  strategy: {
    title: string; h: string[]; lead: string; facts: string[]; book: string; formats: string; statement: Statement;
    formatsH: string[]; items: [string, string, string, string][]; rail: Rail; split: { h: string[]; p: string; strong: string };
    cross: Crosslink;
  };
  projectsPage: { crumb: string; h: string[]; lead: string; outroH: string[]; outroLead: string; description: string };
  projects: Project[];
  agency: {
    h: string; lead: string; getToKnow: string; statement: Statement; clientsH: string; crawl: string[]; teamLabel: string;
    teamH: string; team: [string, string][]; dnaLabel: string; dnaH: string[]; dna: [string, string][];
    cross: Crosslink; ctaLabel: string; ctaH: string[]; description: string;
  };
  insightsPage: { h: string[]; lead: string; description: string; authorBio: string; ctaH: string[] };
  insights: Insight[];
  contact: {
    h: string[]; description: string; inquiry: string; about: string; topics: string[]; website: string; optional: string;
    websitePh: string; message: string; messageErr: string; name: string; nameErr: string; company: string; emailErr: string;
    phone: string; consentA: string; consentLink: string; consentB: string; send: string; sending: string; reply: string;
    thanks: string; thanksText: string; failed: string; talk: string; cross: Crosslink; bye: string;
  };
  check: {
    title: string; h: string[]; lead: string; start: string; facts: string[]; description: string; question: string;
    back: string; next: string; seeResult: string; result: string; questions: [string, string, [string, string][]][];
    results: Record<'before' | 'after' | 'both', { lead: string; hl: string; text: string; link: [string, string] }>;
    discuss: string; restart: string;
  };
  legal: { legalTitle: string; legalHtml: string; privacyTitle: string; privacyHtml: string };
  notFound: { h: string; text: string; home: string };
};
