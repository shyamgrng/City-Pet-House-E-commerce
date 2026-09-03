"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useCareer } from "@/context/CareerContext";
import { useCatalog } from "@/context/CatalogContext";
import { useDelivery } from "@/context/DeliveryContext";
import { useDoctorRegistration } from "@/context/DoctorRegistrationContext";
import { useOrder } from "@/context/OrderContext";
import { usePets } from "@/context/PetContext";
import { useVet } from "@/context/VetContext";
import { sidebarBadges, sidebarDefs } from "@/lib/admin-data";

function slugFor(key: string) {
  const map: Record<string, string> = {
    pettagarchive: "pet-tag-archive",
    microchiprecords: "microchipping-records",
    vetconsults: "vet-consults",
    petavailable: "pet-available",
    b2bsupply: "b2b-supply",
  };
  return map[key] || key;
}

export default function AdminSidebar() {
  const { user, logout } = useAdminAuth();
  const { applications } = useCareer();
  const { orders } = useOrder();
  const { deliveries } = useDelivery();
  const { bookings } = useVet();
  const { pets } = usePets();
  const { products } = useCatalog();
  const { registrations } = useDoctorRegistration();
  const pathname = usePathname();
  const router = useRouter();
  const newApplicationsCount = applications.filter((a) => a.status === "New").length;
  // Sums every stage of the Deliveries pipeline that still needs admin action: Payment Queue,
  // Orders ready to forward, and Dispatch awaiting a courier -- matches the Deliveries page's own
  // tab badges, so the count "moves" from tab to tab as each order progresses instead of vanishing.
  const readyToForwardCount = orders.filter((o) => o.status === "Payment Approved" && !deliveries.some((d) => d.id === o.id)).length;
  const pendingDeliveriesCount =
    orders.filter((o) => o.status === "Receipt Uploaded").length + readyToForwardCount + deliveries.filter((d) => d.status === "Awaiting Courier").length;
  // Matches the admin Vet Consults page's own "Payment Queue" tab, which includes both statuses.
  const pendingVetConsultsCount = bookings.filter((b) => b.status === "Payment Review" || b.status === "Awaiting Doctor Reconfirm").length;
  const reservedPetsCount = pets.filter((p) => p.status === "Reserved").length;
  // Matches the admin Shop page's own "Low Stock & Out of Stock" list.
  const stockAlertCount = products.filter((p) => p.outOfStock || p.qty === 0 || p.qty <= p.lowStockAlert).length;
  const pendingRegistrationsCount = registrations.filter((r) => r.status === "Pending").length;

  return (
    <div className="w-[200px] shrink-0 bg-[#1A2027] text-white p-5 px-3.5 flex flex-col min-h-screen">
      <div className="font-heading font-bold text-sm mb-5 flex items-center gap-2">
        <Image src="/assets/cph-logo.jpeg" alt="" width={24} height={24} className="rounded-md object-cover" />
        CPH Admin
      </div>
      <div className="flex-1">
        {(() => {
          const liveBadges: Record<string, { count: number; color: string }> = {
            career: { count: newApplicationsCount, color: "#C9962B" },
            deliveries: { count: pendingDeliveriesCount, color: "#D64545" },
            vetconsults: { count: pendingVetConsultsCount, color: "#D64545" },
            petavailable: { count: reservedPetsCount, color: "#C9962B" },
            shop: { count: stockAlertCount, color: "#D64545" },
            accounts: { count: pendingRegistrationsCount, color: "#7A56C8" },
          };
          return sidebarDefs.map((s) => {
            const slug = slugFor(s.key);
            const href = `/admin/${slug}`;
            const active = pathname === href;
            const badge = liveBadges[s.key] ?? sidebarBadges[s.key];
            return (
              <Link
                key={s.key}
                href={href}
                className="relative px-2.5 py-2.5 rounded-md text-xs mb-0.5 flex justify-between items-center"
                style={{ background: active ? "#1996C8" : "transparent", color: active ? "#fff" : "#C7CDD3" }}
              >
                <span>{s.label}</span>
                {badge && badge.count > 0 && (
                  <span
                    className="min-w-[18px] h-[18px] px-1.5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                    style={{ background: badge.color }}
                  >
                    {badge.count}
                  </span>
                )}
              </Link>
            );
          });
        })()}
      </div>
      <div className="border-t border-[#2E3742] pt-3">
        <div className="text-[11px] text-[#8A96A3] mb-0.5">{user?.name}</div>
        <div className="text-[10px] text-[#6B7480] mb-2.5">{user?.role}</div>
        <div
          onClick={() => {
            logout();
            router.replace("/admin/login");
          }}
          className="text-xs font-semibold text-[#F0A0A0] cursor-pointer"
        >
          Log Out
        </div>
      </div>
    </div>
  );
}
