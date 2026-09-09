"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useB2B } from "@/context/B2BContext";
import { useB2BRegistration } from "@/context/B2BRegistrationContext";
import { useCareer } from "@/context/CareerContext";
import { useCatalog } from "@/context/CatalogContext";
import { useCourierRegistration } from "@/context/CourierRegistrationContext";
import { useDelivery } from "@/context/DeliveryContext";
import { useDoctorRegistration } from "@/context/DoctorRegistrationContext";
import { useOrder } from "@/context/OrderContext";
import { usePets } from "@/context/PetContext";
import { useRestock } from "@/context/RestockContext";
import { useVet } from "@/context/VetContext";
import { sidebarBadges, sidebarDefs } from "@/lib/admin-data";
import { awaitsAdmin } from "@/lib/restock-types";

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
  const { submissions } = useB2B();
  const { orders: restockOrders } = useRestock();
  const { registrations: doctorRegistrations } = useDoctorRegistration();
  const { registrations: courierRegistrations } = useCourierRegistration();
  const { registrations: b2bRegistrations } = useB2BRegistration();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
  // Combines pending Doctor, Courier, and B2B applications -- matches the Accounts page's own
  // "Pending Registrations" list, which lists all three together.
  const pendingRegistrationsCount =
    doctorRegistrations.filter((r) => r.status === "Pending").length +
    courierRegistrations.filter((r) => r.status === "Pending").length +
    b2bRegistrations.filter((r) => r.status === "Pending").length;
  // Matches the B2B Supply page's own "Pending Review" list of product submissions, plus any
  // restock offers from suppliers awaiting a response, so the badge covers both sections.
  const pendingSubmissionsCount = submissions.filter((s) => s.status === "Pending").length + restockOrders.filter(awaitsAdmin).length;

  return (
    <>
      <div className="lg:hidden sticky top-0 z-30 bg-[#1A2027] text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-md border border-white/20 cursor-pointer text-lg"
          aria-label="Open menu"
        >
          ☰
        </button>
        <div className="font-heading font-bold text-sm flex items-center gap-2">
          <Image src="/assets/cph-logo.jpeg" alt="" width={24} height={24} className="rounded-md object-cover" />
          CPH Admin
        </div>
        <div className="w-9" />
      </div>

      {open && <div onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 z-40 bg-black/50" />}

      <div
        className={`w-[220px] max-w-[80vw] shrink-0 bg-[#1A2027] text-white p-5 px-3.5 flex flex-col fixed inset-y-0 left-0 z-50 overflow-y-auto transition-transform duration-200 lg:static lg:translate-x-0 lg:min-h-screen ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="font-heading font-bold text-sm flex items-center gap-2">
            <Image src="/assets/cph-logo.jpeg" alt="" width={24} height={24} className="rounded-md object-cover" />
            CPH Admin
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-md border border-white/20 cursor-pointer text-sm shrink-0"
            aria-label="Close menu"
          >
            ✕
          </button>
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
            b2bsupply: { count: pendingSubmissionsCount, color: "#C9962B" },
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
                onClick={() => setOpen(false)}
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
    </>
  );
}
