"use client";

import LegalPageView from "@/components/LegalPageView";
import { useLegal } from "@/context/LegalContext";

export default function TermsPage() {
  const { terms, ready } = useLegal();
  if (!ready) return null;
  return <LegalPageView title="Terms & Conditions" doc={terms} />;
}
