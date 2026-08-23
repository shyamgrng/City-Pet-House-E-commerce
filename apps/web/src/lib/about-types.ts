export type AboutListItem = {
  id: string;
  title: string;
  desc: string;
  /** Only used by "Why Choose Us" items — an uploaded icon image. */
  icon?: string;
};

export type AboutContent = {
  intro: string;
  whyChoose: AboutListItem[];
  commitments: AboutListItem[];
  closingText: string;
};
