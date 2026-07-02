import jsPDF from "jspdf";
import { SOWState } from "@/types/sow";
import { Question } from "@/types/sow";

export function generateSOWPdf(state: SOWState, questions: Question[]): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  const ensureSpace = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const text = (str: string, opts: { size?: number; bold?: boolean; color?: [number, number, number]; gap?: number } = {}) => {
    const { size = 11, bold = false, color = [20, 20, 20], gap = 4 } = opts;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(str || "", pageW - margin * 2);
    lines.forEach((ln: string) => {
      ensureSpace(size + gap);
      doc.text(ln, margin, y);
      y += size + gap;
    });
  };

  // Header
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Phaos AI — SOW Statement of Work", margin, 44);
  y = 90;

  text(`Company: ${state.companyName}`, { size: 13, bold: true });
  if (state.locationAddress) text(`Location Address: ${state.locationAddress}`);
  if (state.approvedBy) text(`Approved By: ${state.approvedBy}`);
  if (state.projectApprovalDate) text(`Approved Date: ${state.projectApprovalDate}`);
  if (state.targetGoLiveDate) text(`Target Go-Live Date: ${state.targetGoLiveDate}`);
  if (state.projectDeliverables) text(`Project Deliverables: ${state.projectDeliverables}`);
  text(`Version: v${state.version}`);
  if (state.submittedAt) text(`Submitted: ${state.submittedAt}`);
  y += 8;

  text("Customer Contacts", { size: 13, bold: true, color: [80, 40, 160] });
  state.contactsCustomer.forEach((c, i) => {
    text(`${i + 1}. ${c.name} — ${c.email} — ${c.phone}`);
  });
  y += 6;

  text("Phaos AI Contacts", { size: 13, bold: true, color: [80, 40, 160] });
  state.contactsPhaos.forEach((c, i) => {
    text(`${i + 1}. ${c.name} — ${c.email} — ${c.phone}`);
  });
  y += 10;

  text("Questionnaire Responses", { size: 14, bold: true, color: [80, 40, 160] });
  y += 4;
  questions.forEach((q, idx) => {
    const ans = state.answers[q.id] ?? "";
    text(`${idx + 1}. ${q.label}`, { bold: true });
    text(ans || "(no answer)", { color: [60, 60, 60] });
    y += 6;
  });

  y += 8;
  text("Activity Log", { size: 13, bold: true, color: [80, 40, 160] });
  state.actionLog.forEach((line) => text(line, { size: 10, color: [80, 80, 80] }));

  return doc;
}
