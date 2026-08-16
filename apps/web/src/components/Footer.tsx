import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 text-[13px] text-text-secondary sm:grid-cols-4">
        <div>
          <p className="mb-3 font-heading font-bold text-text-dark">City Pet House</p>
          <p>Boudha, Gokarneshwor-6, Kathmandu</p>
          <p>+977 9851313717</p>
          <p>9:00 AM – 7:00 PM, daily</p>
        </div>
        <div>
          <p className="mb-3 font-semibold text-text-dark">Shop</p>
          <Link href="/shop" className="block py-1 hover:text-primary">All Products</Link>
          <Link href="/pets" className="block py-1 hover:text-primary">Pets Available</Link>
          <Link href="/adoption" className="block py-1 hover:text-primary">Adoption</Link>
        </div>
        <div>
          <p className="mb-3 font-semibold text-text-dark">Company</p>
          <Link href="/about" className="block py-1 hover:text-primary">About Us</Link>
          <Link href="/contact" className="block py-1 hover:text-primary">Contact</Link>
          <Link href="/careers" className="block py-1 hover:text-primary">Careers</Link>
        </div>
        <div>
          <p className="mb-3 font-semibold text-text-dark">Legal</p>
          <Link href="/terms" className="block py-1 hover:text-primary">Terms &amp; Conditions</Link>
          <Link href="/privacy" className="block py-1 hover:text-primary">Privacy Policy</Link>
          <Link href="/refund-policy" className="block py-1 hover:text-primary">Return &amp; Refund</Link>
        </div>
      </div>
    </footer>
  );
}
