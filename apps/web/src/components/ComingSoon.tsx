export function ComingSoon({ section }: { section: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-white py-24 text-center">
      <p className="mb-1 text-[15px] font-semibold text-text-dark">{section}</p>
      <p className="text-[13px] text-text-muted">This section hasn&apos;t been built yet.</p>
    </div>
  );
}
