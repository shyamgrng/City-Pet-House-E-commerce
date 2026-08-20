import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { AboutProvider } from "@/context/AboutContext";
import { AdoptionProvider } from "@/context/AdoptionContext";
import { AuthProvider } from "@/context/AuthContext";
import { B2BAuthProvider } from "@/context/B2BAuthContext";
import { B2BProvider } from "@/context/B2BContext";
import { BlogProvider } from "@/context/BlogContext";
import { CareerProvider } from "@/context/CareerContext";
import { CartProvider } from "@/context/CartContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { CourierAuthProvider } from "@/context/CourierAuthContext";
import { DeliveryProvider } from "@/context/DeliveryContext";
import { DoctorAuthProvider } from "@/context/DoctorAuthContext";
import { OrderProvider } from "@/context/OrderContext";
import { PetProvider } from "@/context/PetContext";
import { PetTagProvider } from "@/context/PetTagContext";
import { ServiceProvider } from "@/context/ServiceContext";
import { VetProvider } from "@/context/VetContext";
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
        <AuthProvider>
          <DoctorAuthProvider>
            <B2BAuthProvider>
              <B2BProvider>
                <CourierAuthProvider>
                  <DeliveryProvider>
                    <VetProvider>
                      <ServiceProvider>
                        <CatalogProvider>
                          <CartProvider>
                            <OrderProvider>
                              <PetProvider>
                                <AdoptionProvider>
                                  <BlogProvider>
                                    <AboutProvider>
                                      <CareerProvider>
                                        <PetTagProvider>{children}</PetTagProvider>
                                      </CareerProvider>
                                    </AboutProvider>
                                  </BlogProvider>
                                </AdoptionProvider>
                              </PetProvider>
                            </OrderProvider>
                          </CartProvider>
                        </CatalogProvider>
                      </ServiceProvider>
                    </VetProvider>
                  </DeliveryProvider>
                </CourierAuthProvider>
              </B2BProvider>
            </B2BAuthProvider>
          </DoctorAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
