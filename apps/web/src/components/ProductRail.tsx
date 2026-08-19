import ProductCard from "./ProductCard";
import type { HomeProduct } from "@/lib/home-data";

export default function ProductRail({
  title,
  products,
  seeAll = true,
  padBottom = "pb-7",
}: {
  title: string;
  products: HomeProduct[];
  seeAll?: boolean;
  padBottom?: string;
}) {
  return (
    <div>
      <div className="px-8 pb-2.5 flex justify-between items-center">
        <div className="font-heading font-bold text-base text-[#1A2027]">{title}</div>
        {seeAll && <div className="text-xs text-primary font-semibold cursor-pointer">See all →</div>}
      </div>
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 px-8 ${padBottom}`}>
        {products.map((p) => (
          <ProductCard key={p.name} product={p} />
        ))}
      </div>
    </div>
  );
}
