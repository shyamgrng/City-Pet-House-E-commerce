import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { AdoptionProvider } from "@/context/AdoptionContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { PetProvider } from "@/context/PetContext";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "City Pet House & Animal Clinic — Shop, Puppies, Adoption & Vet Consults in Kathmandu",
  description:
    "Shop pet food, accessories & grooming supplies, browse puppies for sale, post adoption notices, and book online or in-clinic vet consults — all in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CatalogProvider>
          <PetProvider>
            <AdoptionProvider>{children}</AdoptionProvider>
          </PetProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
