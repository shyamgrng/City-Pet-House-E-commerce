export type SiteSettings = {
  businessName: string;
  shortName: string;
  siteUrl: string;
  phone: string;
  address: string;
  email: string;
  hours: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  vaccinationAppStoreUrl: string;
  vaccinationGooglePlayUrl: string;
  shoppingAppLabel: string;
  shoppingAppStoreUrl: string;
  shoppingGooglePlayUrl: string;
};

export const siteSettings: SiteSettings = {
  businessName: "City Pet House & Animal Clinic",
  shortName: "City Pet House",
  // Used to build absolute image URLs for emails (email clients can't resolve relative paths).
  siteUrl: "https://citypethouseweb.vercel.app",
  phone: "+977 9851313717",
  address: "Boudha Pipal Bot, Aryal Gaun, Gokarneshwor-6, Kathmandu",
  email: "citypethouse@gmail.com",
  hours: "9am – 7pm, Sun–Sat",
  facebook: "#",
  instagram: "#",
  tiktok: "#",
  youtube: "#",
  vaccinationAppStoreUrl: "#",
  vaccinationGooglePlayUrl: "#",
  shoppingAppLabel: "Download the PasuSewa App",
  shoppingAppStoreUrl: "#",
  shoppingGooglePlayUrl: "#",
};
