import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { RunChatbotWorkflow } from '../application/use-cases/RunChatbotWorkflow';
import { AnalyticsContextProvider } from '../application/context/AnalyticsContextProvider';
import { OpenRouterService } from '../infrastructure/services/OpenRouterService';
import { ReportAgent } from '../application/agents/ReportAgent';
import { PDFReportGenerator } from '../infrastructure/services/PDFReportGenerator';

const chatbotWorkflow = new RunChatbotWorkflow();

export class AIController {
  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ success: false, message: 'Message field is required' });
      }

      const result = await chatbotWorkflow.execute(message);
      return sendSuccess(res, 'Chat response generated successfully.', {
        query: result.query,
        intent: result.intent,
        response: result.response,
        dbQueryResult: result.dbQueryResult || null,
      });
    } catch (err) { next(err); }
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
      
      PDFReportGenerator.generateReportPDF(res, 'Ministry of Education (MoE) National Graduate Outcomes Report', reportText, 'moe_national_report.pdf');
    } catch (err) { next(err); }
  }
}
