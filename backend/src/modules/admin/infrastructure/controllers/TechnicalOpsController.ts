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
      const env = (req.query.env as string) || 'Production';
      const data = await manageTechnicalOpsUseCase.getFeatureFlags(env);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateFeatureFlag(req: Request, res: Response) {
    try {
      const { flagId, enabled, rolloutPct, env } = req.body;
      const data = await manageTechnicalOpsUseCase.updateFeatureFlag(flagId, enabled, rolloutPct, env || 'Production');
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createFeatureFlag(req: Request, res: Response) {
    try {
      const { name, target, description, enabled, rolloutPct, env } = req.body;
      const data = await manageTechnicalOpsUseCase.createFeatureFlag({ name, target, description, enabled, rolloutPct }, env || 'Production');
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getReleaseInfo(req: Request, res: Response) {
    try {
      const data = await manageTechnicalOpsUseCase.getReleaseInfo();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async rollbackRelease(req: Request, res: Response) {
    try {
      const data = await manageTechnicalOpsUseCase.rollbackRelease();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getActiveSessions(req: Request, res: Response) {
    try {
      const data = await manageTechnicalOpsUseCase.getActiveAdminSessions();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async revokeSession(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }
      const data = await manageTechnicalOpsUseCase.revokeAdminSession(userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async clearBroadcast(req: Request, res: Response) {
    try {
      const data = await manageTechnicalOpsUseCase.clearEmergencyBroadcast();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
