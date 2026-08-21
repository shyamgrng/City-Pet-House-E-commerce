import Link from "next/link";

const portals = [
  { label: "Pet Owner Sign In", href: "/signin" },
  { label: "Admin & Staff Sign In", href: "/admin/login" },
  { label: "Doctor Sign In", href: "/doctor/login" },
  { label: "B2B Supplier Sign In", href: "/b2b/login" },
  { label: "Courier Sign In", href: "/courier/login" },
];

export default function PortalPage() {
  return (
    <div className="py-16 px-8 flex justify-center">
      <div className="w-full max-w-[440px] text-center">
        <div className="font-heading font-extrabold text-[26px] text-[#1A2027] mb-2.5">Staff &amp; Portal Sign In</div>
        <div className="text-sm text-[#5B6773] leading-relaxed mb-8">
          Each role signs in separately from Pet Owner accounts. Choose where you&apos;d like to sign in below.
        </div>

        <div className="flex flex-col gap-3">
          {portals.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="block w-full bg-primary text-white text-center py-3.5 rounded-[9px] text-sm font-semibold cursor-pointer"
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
