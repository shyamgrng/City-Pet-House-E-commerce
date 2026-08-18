import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "../globals.css";
import { DoctorAuthProvider } from "@/context/DoctorAuthContext";

const poppins = Poppins({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-poppins" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "City Pet House — Doctor Portal",
};

// A third Next.js root layout alongside the storefront and admin panel —
// doctor sign-in is its own identity and surface, same reasoning as
// apps/web/app/admin/layout.tsx.
export default function DoctorRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bg-page">
        <DoctorAuthProvider>{children}</DoctorAuthProvider>
      </body>
    </html>
  );
}
