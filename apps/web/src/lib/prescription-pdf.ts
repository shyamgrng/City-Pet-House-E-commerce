// Server-only: reads image assets from disk, so only ever import this from a Route Handler.
import { readFile } from "fs/promises";
import path from "path";
import { type PDFFont, PDFDocument, rgb, StandardFonts } from "pdf-lib";

// US Letter, per the clinic's request: 8.5 x 11 inches at 72pt/inch.
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 42;

export type PrescriptionPdfData = {
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  petName: string;
  petSpecies: string;
  petAge: string;
  reason: string;
  doctorName: string;
  doctorQualification: string;
  doctorNvc: string;
  history: string;
  diagnosis: string;
  medicines: { name: string; dosage: string; frequency: string; duration: string }[];
  advice: string;
};

async function loadAsset(name: string): Promise<Buffer> {
  return readFile(path.join(process.cwd(), "public", "assets", name));
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return ["—"];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Builds the prescription as a one-page US Letter PDF using the clinic's real letterhead
 * header/footer images, for attaching to the prescription email (rather than embedding the
 * letterhead directly in the email body). */
export async function buildPrescriptionPdf(data: PrescriptionPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const [headerBytes, footerBytes, stampBytes] = await Promise.all([
    loadAsset("vet-letterhead-header.png"),
    loadAsset("vet-letterhead-footer.png"),
    loadAsset("vet-clinic-stamp.png"),
  ]);
  const [headerImg, footerImg, stampImg] = await Promise.all([
    doc.embedPng(headerBytes),
    doc.embedPng(footerBytes),
    doc.embedPng(stampBytes),
  ]);

  const headerH = PAGE_WIDTH * (headerImg.height / headerImg.width);
  const footerH = PAGE_WIDTH * (footerImg.height / footerImg.width);
  page.drawImage(headerImg, { x: 0, y: PAGE_HEIGHT - headerH, width: PAGE_WIDTH, height: headerH });
  page.drawImage(footerImg, { x: 0, y: 0, width: PAGE_WIDTH, height: footerH });

  const contentWidth = PAGE_WIDTH - MARGIN * 2;
  const label = rgb(0.54, 0.59, 0.64);
  const ink = rgb(0.1, 0.12, 0.15);
  const body = rgb(0.23, 0.27, 0.32);
  const rule = rgb(0.75, 0.78, 0.81);

  let y = PAGE_HEIGHT - headerH - 26;

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  page.drawText(`Date: ${today}`, { x: PAGE_WIDTH - MARGIN - font.widthOfTextAtSize(`Date: ${today}`, 9), y, size: 9, font, color: label });

  // Owner's Details / Pet's Details bordered table, two columns.
  const rowH = 16;
  const rows = 4;
  const tableH = rowH * (rows + 1); // +1 for the header row
  const tableTop = y;
  const tableBottom = tableTop - tableH;
  const colX = MARGIN + contentWidth / 2;

  page.drawRectangle({ x: MARGIN, y: tableBottom, width: contentWidth, height: tableH, borderColor: rule, borderWidth: 1 });
  page.drawLine({ start: { x: colX, y: tableTop }, end: { x: colX, y: tableBottom }, thickness: 1, color: rule });
  page.drawLine({ start: { x: MARGIN, y: tableTop - rowH }, end: { x: PAGE_WIDTH - MARGIN, y: tableTop - rowH }, thickness: 1, color: rule });

  const colPad = 10;
  page.drawText("Owner's Details", { x: MARGIN + colPad, y: tableTop - rowH + 5, size: 9.5, font: bold, color: ink });
  page.drawText("Pet's Details", { x: colX + colPad, y: tableTop - rowH + 5, size: 9.5, font: bold, color: ink });

  const ownerRows = [
    ["Name", data.ownerName],
    ["Phone", data.ownerPhone],
    ["Email", data.ownerEmail || "—"],
  ];
  const petRows = [
    ["Name", data.petName],
    ["Species", data.petSpecies],
    ["Age", data.petAge],
    ["Reason", data.reason],
  ];
  for (let i = 0; i < 3; i++) {
    const [k, v] = ownerRows[i];
    const rowY = tableTop - rowH * (i + 2) + 5;
    page.drawText(k, { x: MARGIN + colPad, y: rowY, size: 9, font, color: label });
    page.drawText(v, { x: MARGIN + colPad + 42, y: rowY, size: 9, font: bold, color: ink });
  }
  for (let i = 0; i < 4; i++) {
    const [k, v] = petRows[i];
    const rowY = tableTop - rowH * (i + 2) + 5;
    page.drawText(k, { x: colX + colPad, y: rowY, size: 9, font, color: label });
    page.drawText(v, { x: colX + colPad + 46, y: rowY, size: 9, font: bold, color: ink });
  }

  y = tableBottom - 26;

  const SECTION_GAP = 22;
  const section = (title: string, text: string) => {
    page.drawText(title, { x: MARGIN, y, size: 10, font: bold, color: label });
    y -= 16;
    for (const line of wrapText(text, font, 10, contentWidth)) {
      page.drawText(line, { x: MARGIN, y, size: 10, font, color: body });
      y -= 15;
    }
    y -= SECTION_GAP;
  };

  section("Hx", data.history);
  section("Diagnosis", data.diagnosis);

  page.drawText("Rx", { x: MARGIN, y, size: 10, font: bold, color: label });
  y -= 18;
  if (data.medicines.length === 0) {
    page.drawText("No medicines prescribed.", { x: MARGIN, y, size: 10, font, color: body });
    y -= 15;
  } else {
    for (const m of data.medicines) {
      const details = [m.dosage, m.frequency, m.duration].filter(Boolean).join(", ");
      page.drawText(m.name || "—", { x: MARGIN, y, size: 10, font: bold, color: ink });
      if (details) {
        const nameWidth = bold.widthOfTextAtSize(`${m.name || "—"}  `, 10);
        page.drawText(`— ${details}`, { x: MARGIN + nameWidth, y, size: 10, font, color: body });
      }
      y -= 17;
    }
  }
  y -= SECTION_GAP;

  section("Advice / Follow-up", data.advice);

  // Signature block sits just above the footer image, with the clinic stamp placed right up
  // against the doctor's name (rather than off in the far corner) so it reads as a genuine
  // signed-off document.
  const sigY = footerH + 70;
  const nameSize = 12;
  page.drawText(data.doctorName, { x: MARGIN, y: sigY + 30, size: nameSize, font: bold, color: ink });
  if (data.doctorQualification) page.drawText(data.doctorQualification, { x: MARGIN, y: sigY + 18, size: 8, font, color: label });
  if (data.doctorNvc) page.drawText(`NVC No: ${data.doctorNvc}`, { x: MARGIN, y: sigY + 8, size: 8, font, color: label });

  const nameWidth = bold.widthOfTextAtSize(data.doctorName, nameSize);
  const stampSize = 74;
  const stampX = MARGIN + nameWidth + 8;
  const stampY = sigY - 4;
  page.drawImage(stampImg, { x: stampX, y: stampY, width: stampSize, height: stampSize });

  return doc.save();
}
