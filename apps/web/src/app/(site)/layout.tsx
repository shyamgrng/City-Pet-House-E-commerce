import MobileBottomNav from "@/components/MobileBottomNav";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
      <SiteHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
      <MobileBottomNav />
    </div>
  );
}
