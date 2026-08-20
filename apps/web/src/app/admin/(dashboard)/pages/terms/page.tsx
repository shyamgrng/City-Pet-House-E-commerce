"use client";

import LegalDocEditor from "@/components/admin/LegalDocEditor";
import { useLegal } from "@/context/LegalContext";

export default function AdminTermsPage() {
  const { terms, updateTerms } = useLegal();
  return (
    <LegalDocEditor
      title="Terms & Conditions"
      helpText='Full legal content for the public Terms & Conditions page. Start a line with "## " for a numbered section heading, and "- " for a bullet point.'
      doc={terms}
      onUpdate={updateTerms}
    />
  );
}
