import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "../globals.css";
import { B2BAuthProvider } from "@/context/B2BAuthContext";

const poppins = Poppins({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-poppins" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "City Pet House — B2B Supplier Portal",
};

// A fourth Next.js root layout alongside the storefront, admin panel, and
// doctor portal — B2B supplier sign-in is its own identity and surface,
// same reasoning as apps/web/app/doctor/layout.tsx.
export default function B2BRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bg-page">
        <B2BAuthProvider>{children}</B2BAuthProvider>
      </body>
    </html>
  );
}
