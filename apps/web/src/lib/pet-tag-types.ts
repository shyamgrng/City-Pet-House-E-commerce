export type PetTag = {
  id: string;
  tagId: string;
  petName: string;
  photo: string;
  sex: "Male" | "Female";
  age: string;
  breed: string;
  color: string;
  microchip: string;
  notes: string;
  ownerName: string;
  phone: string;
  altPhone: string;
  address: string;
  mapLink: string;
  scans: number;
};

export type PtpSection = { id: string; heading: string; body: string };
export type PtpFaq = { id: string; q: string; a: string };

export type PetTagPageContent = {
  bannerTitle: string;
  bannerSubtitle: string;
  searchCaption: string;
  sections: PtpSection[];
  faqs: PtpFaq[];
};
