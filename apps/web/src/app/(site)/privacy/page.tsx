"use client";

import LegalPageView from "@/components/LegalPageView";
import { useLegal } from "@/context/LegalContext";

export default function PrivacyPage() {
  const { privacy, ready } = useLegal();
  if (!ready) return null;
  return <LegalPageView title="Privacy Policy" doc={privacy} />;
}
