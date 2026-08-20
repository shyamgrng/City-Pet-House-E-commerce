"use client";

import LegalDocEditor from "@/components/admin/LegalDocEditor";
import { useLegal } from "@/context/LegalContext";

export default function AdminRefundPage() {
  const { refund, updateRefund } = useLegal();
  return (
    <LegalDocEditor
      title="Return & Refund"
      helpText='Full legal content for the public Return & Refund page. Start a line with "## " for a numbered section heading, and "- " for a bullet point.'
      doc={refund}
      onUpdate={updateRefund}
    />
  );
}
