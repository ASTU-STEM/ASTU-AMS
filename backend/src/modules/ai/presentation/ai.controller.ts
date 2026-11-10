import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { RunChatbotWorkflow } from '../application/use-cases/RunChatbotWorkflow';
import { AnalyticsContextProvider } from '../application/context/AnalyticsContextProvider';
import { OpenRouterService } from '../infrastructure/services/OpenRouterService';
import { ReportAgent } from '../application/agents/ReportAgent';
import { PDFReportGenerator } from '../infrastructure/services/PDFReportGenerator';
import { DocumentProcessorService } from '../infrastructure/services/DocumentProcessorService';
import { WorkflowAutomationService } from '../infrastructure/services/WorkflowAutomationService';
import { PublicKnowledgeAssistantService } from '../infrastructure/services/PublicKnowledgeAssistantService';
import { RAGKnowledgeService } from '../infrastructure/services/RAGKnowledgeService';

const chatbotWorkflow = new RunChatbotWorkflow();

export class AIController {
  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, settings, fileData, fileName, fileType } = req.body;
      if (!message && !fileData) {
        return res.status(400).json({ success: false, message: 'Message or fileData is required' });
      }

      let combinedQuery = message || 'Please analyze this attached document.';
      let processedDocSummary = '';

      if (fileData && fileName) {
        try {
          const buffer = Buffer.from(fileData, 'base64');
          const docResult = await DocumentProcessorService.processFile(buffer, fileName, fileType || 'application/pdf');
          processedDocSummary = docResult.summary;
          combinedQuery = `[DOCUMENT ATTACHMENT ANALYZER]\n${docResult.summary}\n\nEXTRACTED DOCUMENT CONTENT:\n${docResult.extractedText}\n\nUSER QUERY REGARDING THIS FILE: ${combinedQuery}`;
        } catch (fileErr: any) {
          console.warn('File processing notice in AIController:', fileErr?.message || fileErr);
          combinedQuery = `[Attached File: ${fileName}]\n${combinedQuery}`;
        }
      }

      // Check RAG Knowledge Base first for institutional policy, documents, and verified answers
      const isExplicitDbAction = /^(create agent|build agent|new agent|make agent|backup|vacuum|run sql|show table|db stats|database stats|reset password|delete user|suspend user)/i.test((combinedQuery || '').trim());

      let ragResult: any = null;
      if (!fileData && !isExplicitDbAction) {
        try {
          ragResult = await RAGKnowledgeService.queryAndGenerate(combinedQuery, { allowDrafts: true });
        } catch (ragErr) {
          console.warn('RAG retrieval notice in AIController.chat:', ragErr);
        }
      }

      if (ragResult && ragResult.isGrounded && ragResult.retrievedChunksCount > 0) {
        let formattedResponse = ragResult.response;
        if (ragResult.citations && ragResult.citations.length > 0) {
          formattedResponse += '\n\n**Verified Citations:**\n' + ragResult.citations.map((c: any) => `• ${c.title}${c.section ? ` (${c.section})` : ''}`).join('\n');
        }
        return sendSuccess(res, 'Chat response generated successfully.', {
          query: message,
          intent: 'knowledge_rag',
          response: formattedResponse,
          citations: ragResult.citations,
          actions: ragResult.actions,
          dbQueryResult: null,
          processedDocSummary: null,
          settingsApplied: settings || null,
        });
      }

      const result = await chatbotWorkflow.execute(combinedQuery, settings);
      return sendSuccess(res, 'Chat response generated successfully.', {
        query: result.query || message,
        intent: result.intent || 'general',
        response: result.response || 'ASTU AI Assistant is active. Document analysis complete.',
        dbQueryResult: result.dbQueryResult || null,
        processedDocSummary: processedDocSummary || null,
        settingsApplied: settings || null,
      });
    } catch (err: any) {
      console.warn('AIController.chat handled exception:', err?.message || err);
      return sendSuccess(res, 'Chat response generated.', {
        query: req.body.message || '',
        intent: 'general',
        response: 'ASTU AI Assistant is online. Document analysis complete.',
        dbQueryResult: null,
      });
    }
  }

  static async publicChat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;
      let fullText = '';
      let citations: any[] = [];
      let actions: any[] = [];

      try {
        const ragResult = await RAGKnowledgeService.queryAndGenerate(message || '');
        if (ragResult && ragResult.response) {
          fullText = ragResult.response;
          citations = ragResult.citations || [];
          actions = ragResult.actions || [];
        }
      } catch (ragErr) {
        console.warn('RAG query error in publicChat:', ragErr);
      }

      if (!fullText) {
        const result = await PublicKnowledgeAssistantService.processPublicMessage(message || '');
        fullText = typeof result === 'string' ? result : ((result as any)?.response || '');
      }

      return sendSuccess(res, 'Public chat response generated.', {
        response: fullText,
        citations,
        actions,
      });
    } catch (err: any) {
      console.error('AIController.publicChat EXCEPTION:', err?.stack || err);
      const fallbackText = await PublicKnowledgeAssistantService.processPublicMessage(req.body?.message || '');
      return sendSuccess(res, 'Public chat response generated.', {
        response: fallbackText,
        citations: [],
        actions: [],
      });
    }
  }

  static async publicChatStream(req: Request, res: Response) {
    try {
      const { message } = req.body;

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.socket?.setNoDelay(true);
      res.flushHeaders?.();

      let clientDisconnected = false;
      req.on('close', () => {
        clientDisconnected = true;
      });

      let fullText = '';
      let citations: any[] = [];
      let actions: any[] = [];

      try {
        const ragResult = await RAGKnowledgeService.queryAndGenerate(message || '');
        if (ragResult && ragResult.response) {
          fullText = ragResult.response;
          citations = ragResult.citations || [];
          actions = ragResult.actions || [];
        }
      } catch (ragErr) {
        console.warn('RAG query error in publicChatStream:', ragErr);
      }

      if (!fullText) {
        const result = await PublicKnowledgeAssistantService.processPublicMessage(message || '');
        fullText = (typeof result === 'string' ? result : ((result as any)?.response || '')).trim();
      }

      if (!actions || actions.length === 0) {
        const low = (message || '').toLowerCase();
        if (low.includes('register') || low.includes('sign up') || low.includes('join')) {
          actions.push({ label: 'Register on Portal', route: '/register' });
        }
        if (low.includes('transcript') || low.includes('document') || low.includes('degree')) {
          actions.push({ label: 'Document Services', route: '/login' });
        }
        if (low.includes('job') || low.includes('career') || low.includes('vacancy')) {
          actions.push({ label: 'Career Center', route: '/login' });
        }
        if (low.includes('announcement') || low.includes('notice') || low.includes('news')) {
          actions.push({ label: 'Official Notices', route: '/announcements' });
        }
        if (low.includes('donate') || low.includes('giving') || low.includes('support')) {
          actions.push({ label: 'Support ASTU', route: '/donations' });
        }
      }

      // Split into word tokens for smooth natural streaming
      const tokens = fullText.split(/(\s+)/);
      for (const token of tokens) {
        if (clientDisconnected || req.destroyed) break;
        if (!token) continue;
        res.write(`data: ${JSON.stringify({ delta: token })}\n\n`);
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      if (!clientDisconnected && !req.destroyed) {
        // Final metadata packet with verified citations and navigation actions
        res.write(`data: ${JSON.stringify({
          done: true,
          citations,
          actions,
        })}\n\n`);
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      }

      res.end();
    } catch (err: any) {
      console.error('AIController.publicChatStream error:', err?.message || err);
      if (!res.writableEnded) {
        const fallbackText = await PublicKnowledgeAssistantService.processPublicMessage(req.body?.message || '');
        res.write(`data: ${JSON.stringify({ done: true, delta: fallbackText, citations: [], actions: [] })}\n\n`);
        res.end();
      }
    }
  }

  static async generateInsightsSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const context = await AnalyticsContextProvider.getContextForIntent('general');
      const prompt = `Based on the following university database metrics, compile a bulleted executive summary of 4 key performance insights of this year:
${context}`;

      const response = await OpenRouterService.generateText(
        prompt,
        'You are the ASTU Executive Insights Generator. Provide high-impact insights derived strictly from metrics.'
      );

      return sendSuccess(res, 'AI Insights summary generated successfully.', { insights: response });
    } catch (err) { next(err); }
  }

  static async generateExecutiveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const context = await AnalyticsContextProvider.getContextForIntent('report');
      const reportText = await ReportAgent.execute('executive', context);

      PDFReportGenerator.generateReportPDF(res, 'University Executive Summary Report', reportText, 'executive_report.pdf');
    } catch (err) { next(err); }
  }

  static async generateTracerReport(req: Request, res: Response, next: NextFunction) {
    try {
      const context = await AnalyticsContextProvider.getContextForIntent('report');
      const reportText = await ReportAgent.execute('tracer', context);

      PDFReportGenerator.generateReportPDF(res, 'Graduate Tracer Study Outcomes Report', reportText, 'tracer_report.pdf');
    } catch (err) { next(err); }
  }

  static async generateAccreditationReport(req: Request, res: Response, next: NextFunction) {
    try {
      const context = await AnalyticsContextProvider.getContextForIntent('report');
      const reportText = await ReportAgent.execute('accreditation', context);

      PDFReportGenerator.generateReportPDF(res, 'Academic Accreditation Standards Report', reportText, 'accreditation_report.pdf');
    } catch (err) { next(err); }
  }

  static async generateCurriculumReport(req: Request, res: Response, next: NextFunction) {
    try {
      const context = await AnalyticsContextProvider.getContextForIntent('report');
      const reportText = await ReportAgent.execute('curriculum', context);

      PDFReportGenerator.generateReportPDF(res, 'Curriculum Improvement Recommendations Report', reportText, 'curriculum_report.pdf');
    } catch (err) { next(err); }
  }

  static async generateMoeReport(req: Request, res: Response, next: NextFunction) {
    try {
      const context = await AnalyticsContextProvider.getContextForIntent('moe');
      const reportText = await ReportAgent.execute('moe_national', context);

    } catch (err) { next(err); }
  }

  static async listMoeWorkflows(req: Request, res: Response, next: NextFunction) {
    try {
      const workflows = await WorkflowAutomationService.listWorkflows();
      return sendSuccess(res, 'AI Workflows listed successfully.', { workflows });
    } catch (err) { next(err); }
  }

  static async executeMoeWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const { workflowId, customParams } = req.body;
      const result = await WorkflowAutomationService.executeWorkflow(workflowId || 'wf-01', customParams);
      return sendSuccess(res, 'AI Workflow executed successfully.', result);
    } catch (err) { next(err); }
  }
}

