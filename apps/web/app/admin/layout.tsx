import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "../globals.css";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

const poppins = Poppins({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-poppins" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "City Pet House — Admin",
};

// A second Next.js root layout (Route Groups let a subtree opt out of the
// storefront's html/body/Header/Footer entirely) — staff/admin sign-in is a
// wholly separate identity and surface from the pet-owner storefront.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bg-page">
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
