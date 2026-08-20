"use client";

import LegalPageView from "@/components/LegalPageView";
import { useLegal } from "@/context/LegalContext";

export default function RefundPage() {
  const { refund, ready } = useLegal();
  if (!ready) return null;
  return <LegalPageView title="Return & Refund Policy" doc={refund} />;
}
