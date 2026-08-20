export type HowToBuyStep = {
  icon: string;
  title: string;
  desc: string;
  items: string[];
  note?: string;
  benefits?: string;
  video?: string;
};

export type HowToBuyContent = {
  intro: string;
  steps: HowToBuyStep[];
};
