import type { CourierAccount } from "./courier-auth-types";
import { type CourierPackageSize, courierPackageSizes } from "./catalog-types";

/** A subtotal-value bracket the delivery fee can fall into, independent of package size -- e.g.
 * "Rs. 6,000 and up ships free". `maxAmount: null` means the top, open-ended bracket. */
export type DeliveryFeeTier = {
  id: string;
  minAmount: number;
  maxAmount: number | null;
  fee: number;
  active: boolean;
};

/** City Pet House's own customer-facing fee per package size, set by CPH directly. This is
 * completely independent of any courier's rate card -- what a courier costs us is tracked
 * separately via calculateCourierCost and never shown to the customer. */
export type StandardRates = {
  standardFeeSmall: number;
  standardFeeMedium: number;
  standardFeeLarge: number;
  standardFeeVeryLarge: number;
};

export type DeliveryFeeItem = { subtotal: number; tier: CourierPackageSize };

export type DeliveryFeeInput = {
  /** One entry per distinct product in the cart, with its line subtotal and package size. */
  items: DeliveryFeeItem[];
  standardRates: StandardRates;
  feeTiers: DeliveryFeeTier[];
  /** The highest package tier still eligible for a value-tier discount (e.g. "Medium" = Small & Medium qualify; Large/Very Large always pay the full size-based fee). */
  freeDeliveryMaxTier: CourierPackageSize;
};

export type DeliveryFeeResult = {
  /** The fee actually charged -- whichever of sizeFee/valueTierFee applies. */
  fee: number;
  tier: CourierPackageSize | null;
  /** The size-based fee, from City Pet House's own standard rates for this tier. */
  sizeFee: number;
  /** The subtotal-value tier's fee, or null if no tier matched at all. */
  valueTierFee: number | null;
  /** True when the value tier's fee was cheaper and was actually used instead of the size-based fee. */
  valueTierApplied: boolean;
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

function standardRateForTier(rates: StandardRates, tier: CourierPackageSize): number {
  switch (tier) {
    case "Small":
      return rates.standardFeeSmall;
    case "Medium":
      return rates.standardFeeMedium;
    case "Large":
      return rates.standardFeeLarge;
    case "Very Large":
      return rates.standardFeeVeryLarge;
  }
}

/** The single largest package tier across every distinct item in the cart -- one order gets one
 * delivery fee, sized to its biggest item, not a fee per item. */
function highestTier(items: DeliveryFeeItem[]): CourierPackageSize {
  return items.reduce<CourierPackageSize>((highest, i) => (tierRank(i.tier) > tierRank(highest) ? i.tier : highest), "Small");
}

/** The subtotal-value bracket an amount falls into. Active tiers should be contiguous, but if the
 * amount falls below the lowest tier's minAmount (or into a gap), fall back to the nearest active
 * tier rather than leaving the delivery fee undefined. */
export function matchFeeTier(tiers: DeliveryFeeTier[], amount: number): DeliveryFeeTier | null {
  const active = tiers.filter((t) => t.active);
  if (active.length === 0) return null;

  const match = active.find((t) => amount >= t.minAmount && (t.maxAmount == null || amount <= t.maxAmount));
  if (match) return match;

  const sorted = [...active].sort((a, b) => a.minAmount - b.minAmount);
  if (amount < sorted[0].minAmount) return sorted[0];
  console.warn(`[matchFeeTier] No delivery fee tier covers amount ${amount} -- check for gaps between tiers.`);
  return sorted[sorted.length - 1];
}

function amountToUnlockFreeTier(tiers: DeliveryFeeTier[], subtotal: number): number | null {
  const freeTier = tiers.filter((t) => t.active && t.fee === 0).sort((a, b) => a.minAmount - b.minAmount)[0];
  if (!freeTier || subtotal >= freeTier.minAmount) return null;
  return freeTier.minAmount - subtotal;
}

/**
 * What the CUSTOMER is charged for delivery. Combines two independent pricing dimensions: a
 * package-size-based fee (City Pet House's own standard rates -- never a courier's rate card) and
 * a subtotal-value tier table (e.g. "Rs. 6,000+ ships free"). The cart is charged whichever is
 * cheaper, except oversized items (above `freeDeliveryMaxTier`) never qualify for the value-tier
 * discount -- they always pay the full size-based fee, the same protection the old single free-
 * delivery threshold gave against under-charging for large/heavy packages.
 *
 * What a courier actually costs City Pet House is a separate, internal-only number -- see
 * calculateCourierCost below.
 */
export function calculateDeliveryFee({ items, standardRates, feeTiers, freeDeliveryMaxTier }: DeliveryFeeInput): DeliveryFeeResult {
  if (items.length === 0) {
    return {
      fee: 0,
      tier: null,
      sizeFee: 0,
      valueTierFee: null,
      valueTierApplied: false,
      freeDeliveryApplied: false,
      freeDeliveryBlockedReason: null,
      amountToUnlockFreeDelivery: null,
    };
  }

  const tier = highestTier(items);
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const sizeFee = standardRateForTier(standardRates, tier);

  const oversized = tierRank(tier) > tierRank(freeDeliveryMaxTier);
  const matchedValueTier = matchFeeTier(feeTiers, subtotal);
  const valueTierFee = matchedValueTier ? matchedValueTier.fee : null;
  const valueTierIsCheaper = valueTierFee !== null && valueTierFee < sizeFee;

  if (oversized || !valueTierIsCheaper) {
    return {
      fee: sizeFee,
      tier,
      sizeFee,
      valueTierFee,
      valueTierApplied: false,
      freeDeliveryApplied: false,
      freeDeliveryBlockedReason:
        oversized && valueTierFee !== null && valueTierFee < sizeFee
          ? `Discounted delivery doesn't apply to oversized items in your cart (contains a "${tier}" item).`
          : null,
      amountToUnlockFreeDelivery: oversized ? null : amountToUnlockFreeTier(feeTiers, subtotal),
    };
  }

  return {
    fee: valueTierFee,
    tier,
    sizeFee,
    valueTierFee,
    valueTierApplied: true,
    freeDeliveryApplied: valueTierFee === 0,
    freeDeliveryBlockedReason: null,
    amountToUnlockFreeDelivery: null,
  };
}

export type CourierCostResult = { cost: number; tier: CourierPackageSize | null; courierName: string };

/** What the COURIER costs us for this order -- their tier rate plus their percentage of the
 * order's subtotal. Purely internal: never shown to the customer, and unaffected by any free
 * delivery or value-tier discount we give the customer (we still pay the courier their real
 * cost regardless of what we charged for delivery). */
export function calculateCourierCost(items: DeliveryFeeItem[], courier: CourierAccount | null): CourierCostResult {
  if (!courier || items.length === 0) {
    return { cost: 0, tier: null, courierName: "" };
  }
  const tier = highestTier(items);
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const pctCharge = Math.round((subtotal * courier.orderValuePct) / 100);
  return { cost: rateForTier(courier, tier) + pctCharge, tier, courierName: courier.companyName };
}
