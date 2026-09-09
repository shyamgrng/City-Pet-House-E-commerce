import type { CourierPackageSize, Product } from "./catalog-types";

export type SubmissionStatus = "Pending" | "Approved" | "Rejected";

export type B2BProductSubmission = {
  id: string;
  b2bId: string;
  companyName: string;
  name: string;
  desc: string;
  photos: string[];
  category: string;
  sku: string;
  brand: string;
  price: number;
  qty: number;
  lowStockAlert: number;
  sizes: string[];
  colours: string[];
  courierPackageSize: CourierPackageSize;
  tags: string[];
  newArrival: boolean;
  hotSale: boolean;
  hotDiscount: number;
  todaysDeal: boolean;
  dealStart: string;
  dealEnd: string;
  outOfStock: boolean;
  commissionPct: number;
  status: SubmissionStatus;
  submittedAt: number;
  /** Id of the catalog product this submission is listed as, once live. Unset for legacy rejected/pending records. */
  productId?: string;
  /** Whether the listing should show on the storefront (Active) or stay hidden (Draft), set by the B2B seller. */
  listingStatus: "active" | "draft";
};

export function netPayout(sub: B2BProductSubmission) {
  return Math.round(sub.price * sub.qty * (1 - sub.commissionPct / 100));
}

export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  Pending: "#B8860B",
  Approved: "#1F7A4D",
  Rejected: "#D64545",
};

/** Human-facing label for a submission's listing status, from the seller's point of view. */
export function listingLabel(s: Pick<B2BProductSubmission, "status" | "listingStatus">) {
  if (s.status === "Approved") return s.listingStatus === "draft" ? "Draft" : "Live";
  if (s.status === "Rejected") return "Removed by City Pet House";
  return "Pending Review";
}

/** Maps a B2B seller's submission into the shape CatalogContext.addProduct expects, so it can be listed live immediately. */
export function submissionToProductInput(
  s: Pick<
    B2BProductSubmission,
    | "name"
    | "desc"
    | "photos"
    | "category"
    | "sku"
    | "brand"
    | "price"
    | "qty"
    | "lowStockAlert"
    | "sizes"
    | "colours"
    | "companyName"
    | "commissionPct"
    | "courierPackageSize"
    | "tags"
    | "newArrival"
    | "hotSale"
    | "hotDiscount"
    | "todaysDeal"
    | "dealStart"
    | "dealEnd"
    | "outOfStock"
    | "listingStatus"
  >,
): Omit<Product, "id"> {
  return {
    name: s.name,
    desc: s.desc,
    photo: s.photos[0] || "",
    photos: s.photos,
    photoAlts: s.photos.map(() => ""),
    category: s.category,
    sku: s.sku,
    brand: s.brand,
    price: s.price,
    costPrice: 0,
    rating: 0,
    qty: s.qty,
    lowStockAlert: s.lowStockAlert,
    sizes: s.sizes,
    colours: s.colours,
    suppliedBy: s.companyName,
    commissionPercent: s.commissionPct,
    courierPackageSize: s.courierPackageSize,
    tags: s.tags,
    newArrival: s.newArrival,
    hotSale: s.hotSale,
    hotDiscount: s.hotDiscount,
    todaysDeal: s.todaysDeal,
    dealStart: s.dealStart,
    dealEnd: s.dealEnd,
    outOfStock: s.outOfStock,
    status: s.listingStatus,
  };
}
