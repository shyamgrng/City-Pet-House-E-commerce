export type LegalDoc = {
  effectiveDate: string;
  lastUpdated: string;
  content: string;
};

export type LegalListBlock = { isList: true; items: { text: string }[] };
export type LegalTextBlock = { isList: false; text: string };
export type LegalBlock = LegalListBlock | LegalTextBlock;

export type LegalSection = {
  number: string;
  heading: string;
  blocks: LegalBlock[];
};

export function parseLegalSections(text: string): LegalSection[] {
  const lines = (text || "").split("\n");
  const sections: LegalSection[] = [];
  let current: LegalSection | null = null;
  let listBuf: LegalListBlock | null = null;

  const flushList = () => {
    if (listBuf && listBuf.items.length && current) current.blocks.push(listBuf);
    listBuf = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      flushList();
      const heading = line.slice(3).trim();
      const m = heading.match(/^(\d+)\.\s*(.*)$/);
      current = { number: m ? m[1] : "", heading: m ? m[2] : heading, blocks: [] };
      sections.push(current);
    } else if (line.startsWith("- ")) {
      if (!current) continue;
      if (!listBuf) listBuf = { isList: true, items: [] };
      listBuf.items.push({ text: line.slice(2).trim() });
    } else if (line === "") {
      flushList();
    } else {
      if (!current) continue;
      flushList();
      current.blocks.push({ isList: false, text: line });
    }
  }
  flushList();
  return sections;
}
