export type FaqItem = { id: string; cat: string; q: string; a: string };

export type FaqPageContent = {
  pageTitle: string;
  pageSubtitle: string;
  contactHeading: string;
  contactSubtext: string;
  items: FaqItem[];
};
