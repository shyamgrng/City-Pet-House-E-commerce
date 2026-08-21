import Image from "next/image";
import Link from "next/link";

const roles = [
  { label: "Doctors", href: "/doctor/login", src: "/assets/role-icon-doctor.png", size: 140 },
  { label: "B2B Suppliers", href: "/b2b/login", src: "/assets/role-icon-b2b.png", size: 86 },
  { label: "Courier Agents", href: "/courier/login", src: "/assets/role-icon-courier.png", size: 130 },
];

export default function PortalPage() {
  return (
    <div className="py-[60px] px-8 flex flex-col items-center" style={{ background: "#EAF4FB" }}>
      <div className="font-heading font-bold text-[22px] text-[#1A2027] mb-1.5">How would you like to sign in?</div>
      <div className="text-[13px] text-[#8A96A3] mb-8">Choose your account type to continue</div>

      <div className="grid grid-cols-3 gap-[18px] max-w-[700px] w-full">
        {roles.map((r) => (
          <Link key={r.href} href={r.href} className="flex flex-col items-center cursor-pointer">
            <div
              className="w-[140px] h-[140px] mb-3 rounded-full flex items-center justify-center overflow-hidden"
              style={{ background: "#E4E9EC" }}
            >
              <Image src={r.src} alt={r.label} width={r.size} height={r.size} className="object-contain" />
            </div>
            <div className="text-center text-sm font-bold text-[#1A2027]">{r.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
