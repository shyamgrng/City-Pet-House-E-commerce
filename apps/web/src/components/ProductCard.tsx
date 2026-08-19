import ImagePlaceholder from "./ImagePlaceholder";
import type { HomeProduct } from "@/lib/home-data";

export default function ProductCard({ product, big = false }: { product: HomeProduct; big?: boolean }) {
  return (
    <div className="border border-[#E4E9EC] rounded-[10px] overflow-hidden cursor-pointer">
      <div className="h-[100px] relative">
        <ImagePlaceholder label="product photo" className="absolute inset-0 w-full h-full" />
        {product.badge && (
          <div
            className="absolute top-1.5 left-1.5 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: product.badgeColor }}
          >
            {product.badge}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <div className={`${big ? "text-[13px]" : "text-xs"} text-[#1A2027] font-medium`}>{product.name}</div>
        <div className="flex justify-between items-center mt-1">
          <div className={`${big ? "text-sm" : "text-[13px]"} font-bold text-primary`}>{product.price}</div>
          <div className="text-sm cursor-pointer text-[#C7CDD2]">♥</div>
        </div>
      </div>
    </div>
  );
}
