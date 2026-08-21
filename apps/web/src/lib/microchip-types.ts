export type MicrochipRecord = {
  id: string;
  mcNumber: string;
  ownerName: string;
  wardNo: string;
  municipality: string;
  phone: string;
  altPhone: string;
  houseNo: string;
  district: string;
  provinceNo: string;
  zone: string;
  mapLink: string;
  petName: string;
  photo: string;
  sex: "Male" | "Female";
  age: string;
  color: string;
  breed: string;
  notes: string;
  vetName: string;
  clinic: string;
  mcDate: string;
};

export type McpSection = { id: string; heading: string; body: string };
export type McpFaq = { id: string; q: string; a: string };

export type MicrochipPageContent = {
  bannerTitle: string;
  bannerSubtitle: string;
  searchCaption: string;
  sections: McpSection[];
  faqs: McpFaq[];
};
