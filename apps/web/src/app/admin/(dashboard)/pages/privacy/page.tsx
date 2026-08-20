"use client";

import LegalDocEditor from "@/components/admin/LegalDocEditor";
import { useLegal } from "@/context/LegalContext";

export default function AdminPrivacyPage() {
  const { privacy, updatePrivacy } = useLegal();
  return (
    <LegalDocEditor
      title="Privacy Policy"
      helpText='Full legal content for the public Privacy Policy page. Start a line with "## " for a numbered section heading, and "- " for a bullet point.'
      doc={privacy}
      onUpdate={updatePrivacy}
    />
  );
}
