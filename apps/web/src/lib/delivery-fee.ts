import type { CourierAccount } from "./courier-auth-types";
import { type CourierPackageSize, courierPackageSizes } from "./catalog-types";

export type DeliveryFeeItem = { subtotal: number; tier: CourierPackageSize };

export type DeliveryFeeInput = {
  /** One entry per distinct product in the cart, with its line subtotal and package size. */
  items: DeliveryFeeItem[];
  /** City Pet House's own customer-facing fee per tier -- what the courier costs us is separate. */
  customerFees: Record<CourierPackageSize, number>;
  freeDeliveryThreshold: number;
  /** The highest tier that still qualifies for the free-delivery waiver (e.g. "Medium" = Small & Medium qualify). */
  freeDeliveryMaxTier: CourierPackageSize;
};

export type DeliveryFeeResult = {
  fee: number;
  tier: CourierPackageSize | null;
  freeDeliveryApplied: boolean;
  freeDeliveryBlockedReason: string | null;
  amountToUnlockFreeDelivery: number | null;
};

const tierRank = (t: CourierPackageSize) => courierPackageSizes.indexOf(t);

function rateForTier(courier: CourierAccount, tier: CourierPackageSize): number {
  switch (tier) {
    case "Small":
      return courier.priceSmall;
    case "Medium":
      return courier.priceMedium;
    case "Large":
      return courier.priceLarge;
    case "Very Large":
      return courier.priceVeryLarge;
  }
}

/** The single largest package tier across every distinct item in the cart -- one order gets one
 * delivery fee, sized to its biggest item, not a fee per item. */
function highestTier(items: DeliveryFeeItem[]): CourierPackageSize {
  return items.reduce<CourierPackageSize>((highest, i) => (tierRank(i.tier) > tierRank(highest) ? i.tier : highest), "Small");
}

/** What the CUSTOMER is charged for delivery -- City Pet House's own tiered fee, independent of
 * which courier we happen to be using or what that courier charges us. */
export function calculateDeliveryFee({ items, customerFees, freeDeliveryThreshold, freeDeliveryMaxTier }: DeliveryFeeInput): DeliveryFeeResult {
  if (items.length === 0) {
    return { fee: 0, tier: null, freeDeliveryApplied: false, freeDeliveryBlockedReason: null, amountToUnlockFreeDelivery: null };
  }

  const tier = highestTier(items);
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const baseFee = customerFees[tier];

  const tierQualifies = tierRank(tier) <= tierRank(freeDeliveryMaxTier);
  const meetsThreshold = subtotal >= freeDeliveryThreshold;

  if (meetsThreshold && tierQualifies) {
    return { fee: 0, tier, freeDeliveryApplied: true, freeDeliveryBlockedReason: null, amountToUnlockFreeDelivery: null };
  }

  if (meetsThreshold && !tierQualifies) {
    return {
      fee: baseFee,
      tier,
      freeDeliveryApplied: false,
      freeDeliveryBlockedReason: `Free delivery doesn't apply to oversized items in your cart (contains a "${tier}" item).`,
      amountToUnlockFreeDelivery: null,
    };
  }

  return {
    fee: baseFee,
    tier,
    freeDeliveryApplied: false,
    freeDeliveryBlockedReason: null,
    amountToUnlockFreeDelivery: tierQualifies ? freeDeliveryThreshold - subtotal : null,
  };
}

export type CourierCostResult = { cost: number; tier: CourierPackageSize | null; courierName: string };

/** What the COURIER costs us for this order -- their tier rate plus their percentage of the
 * order's subtotal. Purely internal: never shown to the customer, and unaffected by any free
 * delivery we give the customer (we still pay the courier their real cost). */
export function calculateCourierCost(items: DeliveryFeeItem[], courier: CourierAccount | null): CourierCostResult {
  if (!courier || items.length === 0) {
    return { cost: 0, tier: null, courierName: "" };
  }
  const tier = highestTier(items);
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const pctCharge = Math.round((subtotal * courier.orderValuePct) / 100);
  return { cost: rateForTier(courier, tier) + pctCharge, tier, courierName: courier.companyName };
}
