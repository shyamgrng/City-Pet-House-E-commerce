export type AboutListItem = {
  id: string;
  title: string;
  desc: string;
};

export type AboutContent = {
  intro: string;
  whyChoose: AboutListItem[];
  commitments: AboutListItem[];
  closingText: string;
};
