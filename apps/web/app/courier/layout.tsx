import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "../globals.css";
import { CourierAuthProvider } from "@/context/CourierAuthContext";

const poppins = Poppins({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-poppins" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "City Pet House — Courier Portal",
};

// A fifth Next.js root layout alongside the storefront, admin panel,
// doctor portal, and B2B portal — courier sign-in is its own identity and
// surface, same reasoning as apps/web/app/b2b/layout.tsx.
export default function CourierRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bg-page">
        <CourierAuthProvider>{children}</CourierAuthProvider>
      </body>
    </html>
  );
}
