import Link from "next/link";

const PORTALS = [
  { href: "/admin/login", label: "Admin & Staff", available: true },
  { href: "/doctor/login", label: "Doctor", available: true },
  { href: "/b2b/login", label: "B2B Supplier", available: true },
  { href: "#", label: "Courier", available: false },
];

export default function StaffSignInPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="mb-2 text-[20px]">Staff &amp; Portal Sign In</h1>
      <p className="mb-8 text-[13px] text-text-secondary">
        Each staff role signs in separately from Pet Owner accounts. Choose your portal below.
      </p>
      <div className="flex flex-col gap-3">
        {PORTALS.map((p) =>
          p.available ? (
            <Link
              key={p.label}
              href={p.href}
              className="rounded-control bg-primary px-5 py-3 text-[14px] font-semibold text-white"
            >
              {p.label} Sign In
            </Link>
          ) : (
            <span
              key={p.label}
              className="rounded-control border border-border px-5 py-3 text-[14px] font-medium text-text-muted"
            >
              {p.label} Sign In — coming soon
            </span>
          ),
        )}
      </div>
      <p className="mt-6 text-[12px] text-text-secondary">
        New B2B supplier?{" "}
        <Link href="/b2b/register" className="font-semibold text-primary hover:underline">
          Register your company
        </Link>
      </p>
    </div>
  );
}
