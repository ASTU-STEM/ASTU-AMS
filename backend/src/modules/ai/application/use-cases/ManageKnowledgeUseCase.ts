import prisma from '../../../../core/config/db';
import { DocumentProcessorService } from '../../infrastructure/services/DocumentProcessorService';
import { RAGKnowledgeService } from '../../infrastructure/services/RAGKnowledgeService';

export interface UploadDocumentInput {
  title: string;
  category?: string;
  description?: string;
  accessLevel?: 'PUBLIC' | 'RESTRICTED';
  status?: 'DRAFT' | 'PUBLISHED';
  fileBuffer?: Buffer;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  rawText?: string;
}

export class ManageKnowledgeUseCase {
  /**
   * Upload and index a document (PDF, TXT, MD)
   */
  static async uploadDocument(input: UploadDocumentInput, uploaderName = 'Alumni Office Admin', uploaderId?: string) {
    if (!input.title || !input.title.trim()) {
      throw new Error('Document title is required');
    }

    let extractedText = '';
    let pageCount = 1;

    if (input.fileBuffer && input.fileName) {
      const processed = await DocumentProcessorService.processFile(
        input.fileBuffer,
        input.fileName,
        input.mimeType || 'application/pdf'
      );
      extractedText = processed.extractedText || '';
      pageCount = processed.pageCount || 1;
    } else if (input.rawText) {
      extractedText = input.rawText.trim();
    } else {
      throw new Error('Document must have either a file attachment or raw text content');
    }

    if (!extractedText || extractedText.length < 15) {
      throw new Error('Extracted document content is empty or contains insufficient text');
    }

    // 1. Create document record
    const doc = await (prisma as any).knowledgeDocument.create({
      data: {
        title: input.title.trim(),
        category: input.category || 'General',
        description: input.description || null,
        sourceType: input.fileName ? 'UPLOAD' : 'MANUAL',
        fileName: input.fileName || null,
        mimeType: input.mimeType || 'text/plain',
        fileSize: input.fileSize || (input.fileBuffer ? input.fileBuffer.length : extractedText.length),
        rawContent: extractedText,
        status: input.status || 'PUBLISHED',
        accessLevel: input.accessLevel || 'PUBLIC',
        uploadedBy: uploaderName,
        uploaderId: uploaderId || null,
      },
    });

    // 2. Generate chunks
    const chunks = RAGKnowledgeService.chunkDocument(extractedText, doc.title);
    for (const chunk of chunks) {
      await (prisma as any).knowledgeChunk.create({
        data: {
          documentId: doc.id,
          chunkIndex: chunk.chunkIndex,
          title: chunk.title,
          section: chunk.section,
          pageNumber: pageCount > 1 ? Math.min(pageCount, Math.floor(chunk.chunkIndex / 2) + 1) : 1,
          content: chunk.content,
          tokenCount: chunk.tokenCount,
          embedding: [],
        },
      });
    }

    // 3. Update chunk count
    const updated = await (prisma as any).knowledgeDocument.update({
      where: { id: doc.id },
      data: { chunkCount: chunks.length },
    });

    return {
      document: updated,
      chunksCount: chunks.length,
    };
  }

  /**
   * Create structured FAQ or quick policy entry without file
   */
  static async createFaqEntry(
    input: { question: string; answer: string; category?: string; accessLevel?: 'PUBLIC' | 'RESTRICTED' },
    uploaderName = 'Alumni Office Admin',
    uploaderId?: string
  ) {
    if (!input.question || !input.answer) {
      throw new Error('Question and answer are required');
    }

    const title = input.question.trim();
    const content = `# FAQ: ${title}\n\n**Question**: ${title}\n\n**Answer**:\n${input.answer.trim()}`;

    return this.uploadDocument(
      {
        title,
        category: input.category || 'General',
        description: 'Direct CMS Q&A Entry',
        accessLevel: input.accessLevel || 'PUBLIC',
        status: 'PUBLISHED',
        rawText: content,
      },
      uploaderName,
      uploaderId
    );
  }

  /**
   * List all knowledge documents with optional category or status filters
   */
  static async listDocuments(filter: { category?: string; status?: string; search?: string } = {}) {
    await RAGKnowledgeService.ensureBootstrapKnowledge();

    const where: any = {};
    if (filter.category && filter.category !== 'All') {
      where.category = filter.category;
    }
    if (filter.status && filter.status !== 'All') {
      where.status = filter.status;
    }

    const docs = await (prisma as any).knowledgeDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      return docs.filter(
        (d: any) =>
          (d.title || '').toLowerCase().includes(q) ||
          (d.category || '').toLowerCase().includes(q) ||
          (d.description || '').toLowerCase().includes(q)
      );
    }

    return docs;
  }

  /**
   * Get document by ID along with its indexed chunks for preview
   */
  static async getDocumentDetails(id: string) {
    const doc = await (prisma as any).knowledgeDocument.findUnique({
      where: { id },
    });

    if (!doc) throw new Error('Knowledge document not found');

    const chunks = await (prisma as any).knowledgeChunk.findMany({
      where: { documentId: id },
      orderBy: { chunkIndex: 'asc' },
    });

    return {
      document: doc,
      chunks,
    };
  }

  /**
   * Toggle or update document publication status
   */
  static async updateStatus(id: string, status: 'PUBLISHED' | 'DRAFT' | 'DEACTIVATED', accessLevel?: 'PUBLIC' | 'RESTRICTED') {
    const data: any = { status };
    if (accessLevel) data.accessLevel = accessLevel;

    return (prisma as any).knowledgeDocument.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete document and cascade delete its chunks
   */
  static async deleteDocument(id: string) {
    await (prisma as any).knowledgeChunk.deleteMany({
      where: { documentId: id },
    });

    return (prisma as any).knowledgeDocument.delete({
      where: { id },
    });
  }
}
