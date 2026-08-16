import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { formatNPR } from "@cph/shared-types";
import { ProductActions } from "@/components/ProductActions";
import { ProductCard, ProductCardData } from "@/components/ProductCard";
import { Rail } from "@/components/Rail";

interface ProductDetail extends ProductCardData {
  description: string | null;
  tags: string[];
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  let product: ProductDetail;
  try {
    product = await apiFetch<ProductDetail>(`/products/${params.id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  const similar = await apiFetch<ProductCardData[]>(`/products/${params.id}/similar`).catch(() => []);

  return (
    <div>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-8 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-card border border-border bg-bg-surface">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} className="h-full w-full rounded-card object-cover" />
          ) : (
            <span className="text-[13px] text-text-muted">Photo coming soon</span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {product.brand && <span className="text-[12px] uppercase tracking-wide text-text-muted">{product.brand}</span>}
          <h1 className="text-[22px]">{product.name}</h1>
          {product.rating != null && <span className="text-[13px] text-text-muted">★ {product.rating.toFixed(1)}</span>}
          <span className="font-heading text-[26px] font-bold text-text-dark">{formatNPR(product.price)}</span>
          {product.description && <p className="text-[13px] leading-relaxed text-text-secondary">{product.description}</p>}
          <ProductActions productId={product.id} outOfStock={product.outOfStock} />
        </div>
      </div>

      {similar.length > 0 && (
        <Rail title="Similar Products">
          {similar.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Rail>
      )}
    </div>
  );
}
