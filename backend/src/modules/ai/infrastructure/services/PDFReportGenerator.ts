import PDFDocument from 'pdfkit';
import { Response } from 'express';

export class PDFReportGenerator {
  static generateReportPDF(res: Response, title: string, content: string, filename?: string) {
    const doc = new PDFDocument({ margin: 50, bufferPages: true });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    const finalFilename = filename || `${title.toLowerCase().replace(/\s+/g, '_')}_report.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`);

    // Pipe PDF to Express response
    doc.pipe(res);

    // Header Design
    doc.fillColor('#0D3B66') // Premium Dark Navy
       .fontSize(20)
       .text('ADAMA SCIENCE & TECHNOLOGY UNIVERSITY', { align: 'center' })
       .fontSize(12)
       .fillColor('#555555')
       .text('ASTU Alumni Intelligence Platform', { align: 'center' })
       .moveDown(1.0);

    // Decorative divider line
    doc.strokeColor('#0D3B66')
       .lineWidth(1.5)
       .moveTo(50, doc.y)
       .lineTo(562, doc.y)
       .stroke()
       .moveDown(1.5);

    // Report Title
    doc.fillColor('#0D3B66')
       .fontSize(16)
       .text(title.toUpperCase(), { align: 'left', underline: true })
       .moveDown(1.0);

    // Content Parsing (markdown layout fallback)
    doc.fillColor('#222222')
       .fontSize(10);

    const paragraphs = content.split('\n');
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) {
        doc.moveDown(0.4);
        continue;
      }

      // Check header prefixes
      if (trimmed.startsWith('###')) {
        doc.fillColor('#0D3B66')
           .fontSize(12)
           .text(trimmed.replace('###', '').trim(), { underline: false })
           .fillColor('#222222')
           .fontSize(10)
           .moveDown(0.3);
      } else if (trimmed.startsWith('####')) {
        doc.fillColor('#0D3B66')
           .fontSize(11)
           .text(trimmed.replace('####', '').trim())
           .fillColor('#222222')
           .fontSize(10)
           .moveDown(0.3);
      } else if (trimmed.startsWith('##')) {
        doc.fillColor('#0D3B66')
           .fontSize(13)
           .text(trimmed.replace('##', '').trim())
           .fillColor('#222222')
           .fontSize(10)
           .moveDown(0.4);
      } else if (trimmed.startsWith('#')) {
        doc.fillColor('#0D3B66')
           .fontSize(15)
           .text(trimmed.replace('#', '').trim())
           .fillColor('#222222')
           .fontSize(10)
           .moveDown(0.5);
      } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        doc.text(`  •  ${trimmed.slice(1).trim()}`, { align: 'left' })
           .moveDown(0.2);
      } else {
        doc.text(trimmed, { align: 'justify' })
           .moveDown(0.4);
      }
    }

    // Add footer on all pages
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
         .fillColor('#999999')
         .text(
           `Page ${i + 1} of ${range.count}  |  Generated on ${new Date().toLocaleDateString()}  |  ASTU Decision Support System`,
           50,
           doc.page.height - 40,
           { align: 'center' }
         );
    }

    // End Document
    doc.end();
  }
}
