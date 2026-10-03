import { Request, Response } from 'express';
import { ToolsBackendService } from '../services/tools.service';
import { ToolsAIAgent } from '../services/tools.agent';
import { sendSuccess } from '../../../core/utils/response.utils';

export class ToolsController {
  static async getCategories(req: Request, res: Response) {
    const categories = await ToolsBackendService.getToolCategories();
    return sendSuccess(res, 'Tool categories retrieved successfully', categories);
  }

  static async getSummary(req: Request, res: Response) {
    const summary = await ToolsBackendService.getToolsSummary();
    return sendSuccess(res, 'Tools center summary retrieved successfully', summary);
  }

  static async executeAI(req: Request, res: Response) {
    const { toolId, inputs, userProfile } = req.body;
    if (!toolId) {
      return res.status(400).json({ success: false, message: 'toolId is required' });
    }

    const result = await ToolsAIAgent.executeToolAI(toolId, inputs || {}, userProfile);
    return sendSuccess(res, 'AI Tool execution completed', result);
  }
}
