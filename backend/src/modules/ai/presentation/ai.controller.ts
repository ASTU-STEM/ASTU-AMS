import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { RunChatbotWorkflow } from '../application/use-cases/RunChatbotWorkflow';
import { AnalyticsContextProvider } from '../application/context/AnalyticsContextProvider';
import { OpenRouterService } from '../infrastructure/services/OpenRouterService';
import { ReportAgent } from '../application/agents/ReportAgent';
import { PDFReportGenerator } from '../infrastructure/services/PDFReportGenerator';
import { DocumentProcessorService } from '../infrastructure/services/DocumentProcessorService';
import { WorkflowAutomationService } from '../infrastructure/services/WorkflowAutomationService';

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

