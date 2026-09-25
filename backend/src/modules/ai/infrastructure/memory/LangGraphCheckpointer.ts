import prisma from '../../../../core/config/db';

export interface CheckpointState {
  threadId: string;
  stepIndex: number;
  stateData: any;
  timestamp: string;
}

export class LangGraphCheckpointer {
  private static memoryStore: Map<string, CheckpointState[]> = new Map();

  /**
   * Save checkpoint state for a conversation thread
   */
  public static async saveCheckpoint(threadId: string, stateData: any): Promise<number> {
    if (!this.memoryStore.has(threadId)) {
      this.memoryStore.set(threadId, []);
    }

    const history = this.memoryStore.get(threadId)!;
    const stepIndex = history.length;

    const checkpoint: CheckpointState = {
      threadId,
      stepIndex,
      stateData,
      timestamp: new Date().toISOString(),
    };

    history.push(checkpoint);

    // Persist to PostgreSQL database audit logs
    try {
      await prisma.auditLog.create({
        data: {
          userId: stateData.userId || 'LANGGRAPH_SYSTEM',
          action: `LANGGRAPH_CHECKPOINT_SAVED_${threadId}`,
          details: `Step ${stepIndex} saved. Query: ${JSON.stringify(stateData.query || '').slice(0, 200)}`,
        },
      }).catch(() => {});
    } catch {
      // Memory store fallback
    }

    return stepIndex;
  }

  /**
   * Retrieve state at a specific step (Time Travel / Rewind)
   */
  public static getCheckpointAtStep(threadId: string, stepIndex: number): CheckpointState | null {
    const history = this.memoryStore.get(threadId);
    if (!history || stepIndex < 0 || stepIndex >= history.length) {
      return null;
    }
    return history[stepIndex];
  }

  /**
   * List all available rewind steps for a thread
   */
  public static listCheckpoints(threadId: string): Array<{ stepIndex: number; timestamp: string; summary: string }> {
    const history = this.memoryStore.get(threadId) || [];
    return history.map(h => ({
      stepIndex: h.stepIndex,
      timestamp: h.timestamp,
      summary: h.stateData?.query || 'State snapshot',
    }));
  }
}
