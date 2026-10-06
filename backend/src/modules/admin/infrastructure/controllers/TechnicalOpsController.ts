import { Request, Response } from 'express';
import { ManageTechnicalOps } from '../../application/use-cases/ManageTechnicalOps';

const manageTechnicalOpsUseCase = new ManageTechnicalOps();

export class TechnicalOpsController {
  async getTelemetry(req: Request, res: Response) {
    try {
      const data = await manageTechnicalOpsUseCase.getSystemTelemetry();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getLiveTelemetry(req: Request, res: Response) {
    try {
      const data = await manageTechnicalOpsUseCase.getLiveTelemetry();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSecurityGovernance(req: Request, res: Response) {
    try {
      const data = await manageTechnicalOpsUseCase.getSecurityGovernance();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateSecurityGovernance(req: Request, res: Response) {
    try {
      const { mfa, exportAudit, keyRot } = req.body;
      const data = await manageTechnicalOpsUseCase.updateSecurityGovernance({ mfa, exportAudit, keyRot });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSecurityStatus(req: Request, res: Response) {
    try {
      const data = await manageTechnicalOpsUseCase.getDdosAndSecurityStatus();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getLoadBalancer(req: Request, res: Response) {
    try {
      const data = await manageTechnicalOpsUseCase.getLoadBalancerStatus();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getApiGateway(req: Request, res: Response) {
    try {
      const data = await manageTechnicalOpsUseCase.getApiGatewayStats();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDatabaseDiagnostics(req: Request, res: Response) {
    try {
      const data = await manageTechnicalOpsUseCase.getDatabaseDiagnostics();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async executeAction(req: Request, res: Response) {
    try {
      const { action, payload } = req.body;
      if (!action) {
        return res.status(400).json({ success: false, message: 'Action name is required' });
      }
      const data = await manageTechnicalOpsUseCase.executeSystemAction(action, payload);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async runOwaspScan(req: Request, res: Response) {
    try {
      const data = await manageTechnicalOpsUseCase.runOwaspAuditScan();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async elevateBreakGlass(req: Request, res: Response) {
    try {
      const { reason } = req.body;
      if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
        return res.status(400).json({ success: false, message: 'Justification reason is required' });
      }
      const data = await manageTechnicalOpsUseCase.elevateBreakGlass(reason.trim());
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async blockIp(req: Request, res: Response) {
    try {
      const { ip, reason } = req.body;
      if (!ip || typeof ip !== 'string' || !ip.trim()) {
        return res.status(400).json({ success: false, message: 'IP Address is required' });
      }
      const data = await manageTechnicalOpsUseCase.blockIp(ip.trim(), reason);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async unblockIp(req: Request, res: Response) {
    try {
      const { ip } = req.body;
      if (!ip || typeof ip !== 'string' || !ip.trim()) {
        return res.status(400).json({ success: false, message: 'IP Address is required' });
      }
      const data = await manageTechnicalOpsUseCase.unblockIp(ip.trim());
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getIncidents(req: Request, res: Response) {
    try {
      const data = await manageTechnicalOpsUseCase.getIncidentsAndDrStatus();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getFeatureFlags(req: Request, res: Response) {
    try {
      const data = await manageTechnicalOpsUseCase.getFeatureFlags();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateFeatureFlag(req: Request, res: Response) {
    try {
      const { flagId, enabled, env } = req.body;
      const data = await manageTechnicalOpsUseCase.updateFeatureFlag(flagId, enabled, env);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
