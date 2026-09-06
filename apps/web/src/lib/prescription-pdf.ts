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
  petName: string;
  petSpecies: string;
  petAge: string;
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
  const rule = rgb(0.89, 0.91, 0.93);

  let y = PAGE_HEIGHT - headerH - 28;

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const patientLine = `${data.petName} (${data.petSpecies}, ${data.petAge}) · Owner: ${data.ownerName}`;
  page.drawText(patientLine, { x: MARGIN, y, size: 10.5, font: bold, color: ink });
  page.drawText(today, { x: PAGE_WIDTH - MARGIN - font.widthOfTextAtSize(today, 10), y, size: 10, font, color: ink });
  y -= 12;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 0.75, color: rule });
  y -= 20;

  const section = (title: string, text: string) => {
    page.drawText(title.toUpperCase(), { x: MARGIN, y, size: 8, font: bold, color: label });
    y -= 14;
    for (const line of wrapText(text, font, 10, contentWidth)) {
      page.drawText(line, { x: MARGIN, y, size: 10, font, color: body });
      y -= 14;
    }
    y -= 8;
  };

  section("Pet History", data.history);
  section("Diagnosis / Clinical Notes", data.diagnosis);

  page.drawText("PRESCRIBED MEDICINES", { x: MARGIN, y, size: 8, font: bold, color: label });
  y -= 16;
  if (data.medicines.length === 0) {
    page.drawText("No medicines prescribed.", { x: MARGIN, y, size: 10, font, color: body });
    y -= 14;
  } else {
    for (const m of data.medicines) {
      const details = [m.dosage, m.frequency, m.duration].filter(Boolean).join(", ");
      page.drawText(m.name || "—", { x: MARGIN, y, size: 10, font: bold, color: ink });
      if (details) {
        const nameWidth = bold.widthOfTextAtSize(`${m.name || "—"}  `, 10);
        page.drawText(`— ${details}`, { x: MARGIN + nameWidth, y, size: 10, font, color: body });
      }
      y -= 16;
    }
  }
  y -= 8;

  section("Advice / Follow-up", data.advice);

  // Signature block sits just above the footer image; the page has ~500pt of body room for a
  // single-page letter, which comfortably fits a typical consult's worth of text.
  const sigY = footerH + 66;
  page.drawText(data.doctorName, { x: MARGIN, y: sigY + 26, size: 11, font: bold, color: ink });
  if (data.doctorQualification) page.drawText(data.doctorQualification, { x: MARGIN, y: sigY + 14, size: 8, font, color: label });
  if (data.doctorNvc) page.drawText(`NVC No: ${data.doctorNvc}`, { x: MARGIN, y: sigY + 4, size: 8, font, color: label });
  const stampSize = 60;
  page.drawImage(stampImg, { x: PAGE_WIDTH - MARGIN - stampSize, y: sigY, width: stampSize, height: stampSize });

  return doc.save();
}
