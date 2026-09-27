import prisma from '../../../../core/config/db';

export interface PendingInterruptAction {
  interruptId: string;
  actionType: string;
  actionTitle: string;
  payload: any;
  targetRole: string;
  status: 'PENDING_ADMIN_APPROVAL' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  reviewedBy?: string;
}

export class HumanInTheLoopManager {
  private static pendingActions: Map<string, PendingInterruptAction> = new Map();

  /**
   * Register a high-stakes AI action requiring Admin approval (Interrupt)
   */
  public static async registerInterrupt(
    actionType: string,
    actionTitle: string,
    payload: any,
    targetRole = 'ADMIN'
  ): Promise<PendingInterruptAction> {
    const interruptId = `HITL_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const interrupt: PendingInterruptAction = {
      interruptId,
      actionType,
      actionTitle,
      payload,
      targetRole,
      status: 'PENDING_ADMIN_APPROVAL',
      requestedAt: new Date().toISOString(),
    };

    this.pendingActions.set(interruptId, interrupt);

    // Save to Database audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: payload.userId || 'SYSTEM_AI',
          action: `HITL_INTERRUPT_TRIGGERED_${actionType}`,
          details: `AI Action "${actionTitle}" requires Admin approval before dispatch. Payload: ${JSON.stringify(payload).slice(0, 500)}`,
        },
      }).catch(() => {});
    } catch {}

    return interrupt;
  }

  /**
   * Admin Approve Action (Resume Execution)
   */
  public static async approveInterrupt(interruptId: string, adminUserId: string): Promise<PendingInterruptAction | null> {
    const interrupt = this.pendingActions.get(interruptId);
    if (!interrupt) return null;

    interrupt.status = 'APPROVED';
    interrupt.reviewedBy = adminUserId;

    try {
      await prisma.auditLog.create({
        data: {
          userId: adminUserId,
          action: `HITL_INTERRUPT_APPROVED_${interrupt.actionType}`,
          details: `Admin ${adminUserId} approved AI action "${interrupt.actionTitle}". Proceeding with execution.`,
        },
      }).catch(() => {});
    } catch {}

    return interrupt;
  }

  /**
   * Admin Reject Action
   */
  public static async rejectInterrupt(interruptId: string, adminUserId: string): Promise<PendingInterruptAction | null> {
    const interrupt = this.pendingActions.get(interruptId);
    if (!interrupt) return null;

    interrupt.status = 'REJECTED';
    interrupt.reviewedBy = adminUserId;

    return interrupt;
  }

  /**
   * List all pending actions awaiting approval
   */
  public static listPendingInterrupts(): PendingInterruptAction[] {
    return Array.from(this.pendingActions.values()).filter(i => i.status === 'PENDING_ADMIN_APPROVAL');
  }
}
