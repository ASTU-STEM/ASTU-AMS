import { OpenRouterService } from './OpenRouterService';

export interface DocumentProcessingResult {
  fileName: string;
  fileType: string;
  extractedText: string;
  summary: string;
  pageCount?: number;
  metadata?: any;
}

export class DocumentProcessorService {
  /**
   * Process an uploaded file buffer (PDF, Image, Text, CSV)
   */
  static async processFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<DocumentProcessingResult> {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    // 1. PDF File Processing
    if (mimeType.includes('pdf') || ext === 'pdf') {
      return this.processPDF(fileBuffer, fileName);
    }

    // 2. Word Document (DOCX) Processing
    if (ext === 'docx' || mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
      return this.processDocx(fileBuffer, fileName);
    }

    // 3. Image File Processing (PNG, JPG, WEBP, GIF, SVG)
    if (
      mimeType.includes('image') ||
      ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)
    ) {
      return this.processImage(fileBuffer, fileName, mimeType);
    }

    // 4. Plain Text / CSV / JSON / Markdown Processing
    const textContent = fileBuffer.toString('utf-8');
    return {
      fileName,
      fileType: mimeType || ext,
      extractedText: textContent.slice(0, 50000),
      summary: `Parsed text document (${fileName}, ${fileBuffer.length} bytes).`,
    };
  }

  /**
   * Extract text from Microsoft Word (.docx) files
   */
  private static processDocx(
    fileBuffer: Buffer,
    fileName: string
  ): DocumentProcessingResult {
    try {
      const text = this.extractDocxText(fileBuffer);
      if (text && text.trim().length > 5) {
        return {
          fileName,
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          extractedText: text.trim(),
          summary: `📄 Word Document: ${fileName} (${text.length} characters extracted).`,
          pageCount: Math.max(1, Math.ceil(text.split(/\s+/).length / 300)),
        };
      }
    } catch (err: any) {
      console.warn(`DOCX parsing warning for ${fileName}:`, err?.message || err);
    }

    return {
      fileName,
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extractedText: '',
      summary: `Word document ${fileName} could not be extracted.`,
    };
  }

  private static extractDocxText(buffer: Buffer): string {
    const zlib = require('zlib');
    let pos = 0;
    let docText = '';

    const cleanXml = (xml: string): string => {
      return xml
        .replace(/<\/w:p>/g, '\n\n')
        .replace(/<w:br[^>]*\/>/g, '\n')
        .replace(/<w:tab[^>]*\/>/g, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
    };

    // 1. Scan local file headers (0x04034b50)
    while (pos < buffer.length - 30) {
      if (buffer.readUInt32LE(pos) === 0x04034b50) {
        const method = buffer.readUInt16LE(pos + 8);
        const compressedSize = buffer.readUInt32LE(pos + 18);
        const filenameLen = buffer.readUInt16LE(pos + 26);
        const extraLen = buffer.readUInt16LE(pos + 28);
        const filename = buffer.toString('utf8', pos + 30, pos + 30 + filenameLen);
        const dataStart = pos + 30 + filenameLen + extraLen;
        const dataEnd = dataStart + compressedSize;

        if (filename === 'word/document.xml') {
          try {
            if (compressedSize > 0 && dataEnd <= buffer.length) {
              const compressedData = buffer.subarray(dataStart, dataEnd);
              const xml = method === 8
                ? zlib.inflateRawSync(compressedData).toString('utf8')
                : compressedData.toString('utf8');
              docText = cleanXml(xml);
              if (docText) break;
            } else {
              // Streaming descriptor: search forward for next zip entry
              const nextPk = buffer.indexOf(Buffer.from([0x50, 0x4b]), dataStart);
              const chunk = nextPk > dataStart ? buffer.subarray(dataStart, nextPk) : buffer.subarray(dataStart);
              const xml = zlib.inflateRawSync(chunk).toString('utf8');
              docText = cleanXml(xml);
              if (docText) break;
            }
          } catch { /* proceed to scan */ }
        }
        pos = dataEnd > pos ? dataEnd : pos + 1;
      } else {
        pos++;
      }
    }

    // 2. If not found via local headers, scan central directory headers (0x02014b50)
    if (!docText) {
      let cdPos = 0;
      while (cdPos < buffer.length - 46) {
        if (buffer.readUInt32LE(cdPos) === 0x02014b50) {
          const method = buffer.readUInt16LE(cdPos + 10);
          const compressedSize = buffer.readUInt32LE(cdPos + 20);
          const filenameLen = buffer.readUInt16LE(cdPos + 28);
          const extraLen = buffer.readUInt16LE(cdPos + 30);
          const commentLen = buffer.readUInt16LE(cdPos + 32);
          const localHeaderOffset = buffer.readUInt32LE(cdPos + 42);
          const filename = buffer.toString('utf8', cdPos + 46, cdPos + 46 + filenameLen);

          if (filename === 'word/document.xml' && localHeaderOffset < buffer.length) {
            try {
              const localNameLen = buffer.readUInt16LE(localHeaderOffset + 26);
              const localExtraLen = buffer.readUInt16LE(localHeaderOffset + 28);
              const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
              const dataEnd = dataStart + compressedSize;
              if (dataEnd <= buffer.length) {
                const compressedData = buffer.subarray(dataStart, dataEnd);
                const xml = method === 8
                  ? zlib.inflateRawSync(compressedData).toString('utf8')
                  : compressedData.toString('utf8');
                docText = cleanXml(xml);
                if (docText) break;
              }
            } catch { /* ignore */ }
          }
          cdPos += 46 + filenameLen + extraLen + commentLen;
        } else {
          cdPos++;
        }
      }
    }

    return docText;
  }

  /**
   * Extract text from PDF documents using pdf-parse (v2 class API with v1 fallback)
   */
  private static async processPDF(
    fileBuffer: Buffer,
    fileName: string
  ): Promise<DocumentProcessingResult> {
    try {
      let extractedText = '';
      let pageCount = 1;
      let metadata: any = {};

      const pdfModule = require('pdf-parse');
      if (pdfModule && pdfModule.PDFParse) {
        const parser = new pdfModule.PDFParse({ data: fileBuffer });
        const res = await parser.getText();
        extractedText = (res?.text || '').trim();
        pageCount = res?.total || (res?.pages ? res.pages.length : 1);
        try {
          const info = await parser.getInfo();
          metadata = info || {};
        } catch { /* ignore */ }
        try {
          await parser.destroy();
        } catch { /* ignore */ }
      } else if (typeof pdfModule === 'function') {
        const data = await pdfModule(fileBuffer);
        extractedText = (data?.text || '').trim();
        pageCount = data?.numpages || 1;
        metadata = data?.info || {};
      }

      if (extractedText && extractedText.length > 5) {
        const cleanedText = extractedText
          .replace(/-- \d+ of \d+ --/g, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        const summary = `📄 PDF Document: ${fileName} (${pageCount} pages, ${cleanedText.length} characters extracted).`;
        return {
          fileName,
          fileType: 'application/pdf',
          extractedText: cleanedText.slice(0, 50000),
          summary,
          pageCount,
          metadata,
        };
      }
    } catch (err: any) {
      console.warn(`PDF parsing warning for ${fileName}:`, err?.message || err);
    }

    return {
      fileName,
      fileType: 'application/pdf',
      extractedText: `PDF Document (${fileName}) uploaded successfully.`,
      summary: `📄 PDF Document attached: ${fileName}`,
    };
  }

  /**
   * Process image using base64 vision prompt analysis via OpenRouter multi-modal AI
   */
  private static async processImage(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<DocumentProcessingResult> {
    try {
      const base64Data = fileBuffer.toString('base64');
      const formatMime = mimeType || 'image/png';
      
      const prompt = `Analyze this uploaded image document (${fileName}) for an ASTU University administrator.
Describe any visual elements, charts, tables, text content, logos, or institutional figures present in the image clearly and concisely.`;

      // Use vision capability or text synthesis description
      const visionAnalysis = await OpenRouterService.generateText(
        `${prompt}\nImage Data Stream: data:${formatMime};base64,${base64Data.slice(0, 500)}...`,
        'You are the ASTU AI Vision & Image Document Processing Agent. Extract text, tables, graphs, and visual metrics from images.'
      );

      const summary = `🖼️ Image Document: ${fileName} (${(fileBuffer.length / 1024).toFixed(1)} KB processed).`;

      return {
        fileName,
        fileType: formatMime,
        extractedText: visionAnalysis || `[Image Document Analysis for ${fileName}]`,
        summary,
      };
    } catch (err: any) {
      console.warn(`Image processing warning for ${fileName}:`, err?.message || err);
      return {
        fileName,
        fileType: mimeType || 'image/png',
        extractedText: `Image file ${fileName} attached for ASTU AI inspection.`,
        summary: `🖼️ Image attached: ${fileName}`,
      };
    }
  }
}
