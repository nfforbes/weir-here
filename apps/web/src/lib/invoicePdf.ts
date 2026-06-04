import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  clientName: string;
  clientAddress: string;
  providerName: string;
  description: string;
  serviceDate: string;
  amountDollars: number;
  companyName?: string;
  companyEmail?: string;
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const BLUE = rgb(0.098, 0.463, 0.824);
  const DARK = rgb(0.05, 0.05, 0.1);
  const GREY = rgb(0.4, 0.4, 0.4);
  const LIGHT = rgb(0.95, 0.97, 1);

  // Header background
  page.drawRectangle({ x: 0, y: height - 100, width, height: 100, color: BLUE });

  // Company name
  page.drawText(data.companyName ?? 'Weir Here', {
    x: 40,
    y: height - 55,
    size: 28,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // INVOICE label
  page.drawText('INVOICE', {
    x: width - 160,
    y: height - 55,
    size: 24,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Invoice number & date
  page.drawText(`Invoice #: ${data.invoiceNumber}`, {
    x: 40,
    y: height - 135,
    size: 11,
    font: fontBold,
    color: DARK,
  });
  page.drawText(`Date: ${data.issueDate}`, {
    x: 40,
    y: height - 153,
    size: 11,
    font: fontReg,
    color: GREY,
  });

  // Bill To box
  page.drawRectangle({ x: 40, y: height - 250, width: 240, height: 80, color: LIGHT });
  page.drawText('BILL TO', {
    x: 50,
    y: height - 185,
    size: 9,
    font: fontBold,
    color: BLUE,
  });
  page.drawText(data.clientName, {
    x: 50,
    y: height - 200,
    size: 12,
    font: fontBold,
    color: DARK,
  });
  page.drawText(data.clientAddress, {
    x: 50,
    y: height - 218,
    size: 10,
    font: fontReg,
    color: GREY,
  });

  // Provider info
  page.drawText('CARE PROVIDER', {
    x: 340,
    y: height - 185,
    size: 9,
    font: fontBold,
    color: BLUE,
  });
  page.drawText(data.providerName, {
    x: 340,
    y: height - 200,
    size: 12,
    font: fontBold,
    color: DARK,
  });

  // Table header
  const tableTop = height - 310;
  page.drawRectangle({ x: 40, y: tableTop, width: width - 80, height: 28, color: BLUE });
  page.drawText('Description', { x: 50, y: tableTop + 9, size: 10, font: fontBold, color: rgb(1,1,1) });
  page.drawText('Service Date', { x: 300, y: tableTop + 9, size: 10, font: fontBold, color: rgb(1,1,1) });
  page.drawText('Amount', { x: 490, y: tableTop + 9, size: 10, font: fontBold, color: rgb(1,1,1) });

  // Table row
  const rowTop = tableTop - 30;
  page.drawText(data.description || 'Care services rendered', {
    x: 50,
    y: rowTop + 5,
    size: 10,
    font: fontReg,
    color: DARK,
  });
  page.drawText(data.serviceDate, {
    x: 300,
    y: rowTop + 5,
    size: 10,
    font: fontReg,
    color: DARK,
  });
  page.drawText(`$${data.amountDollars.toFixed(2)}`, {
    x: 490,
    y: rowTop + 5,
    size: 10,
    font: fontBold,
    color: DARK,
  });

  // Divider
  page.drawLine({ start: { x: 40, y: rowTop - 10 }, end: { x: width - 40, y: rowTop - 10 }, thickness: 1, color: LIGHT });

  // Total
  page.drawRectangle({ x: 380, y: rowTop - 60, width: 190, height: 36, color: BLUE });
  page.drawText('TOTAL DUE', { x: 390, y: rowTop - 40, size: 10, font: fontBold, color: rgb(1,1,1) });
  page.drawText(`$${data.amountDollars.toFixed(2)}`, {
    x: 490,
    y: rowTop - 40,
    size: 12,
    font: fontBold,
    color: rgb(1,1,1),
  });

  // Footer
  if (data.companyEmail) {
    page.drawText(`Questions? Contact us at ${data.companyEmail}`, {
      x: 40,
      y: 40,
      size: 9,
      font: fontReg,
      color: GREY,
    });
  }
  page.drawText('Thank you for your business!', {
    x: 40,
    y: 25,
    size: 9,
    font: fontReg,
    color: GREY,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
