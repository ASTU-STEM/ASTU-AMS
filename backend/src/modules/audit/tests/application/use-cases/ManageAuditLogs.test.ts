import {
  CreateAuditLog,
  GetAllAuditLogs,
  GetAuditLogsByUser,
  GetAuditLogsByAction,
  GetAuditLogById,
  PurgeOldAuditLogs,
} from '../../../application/use-cases/ManageAuditLogs';
import { IAuditLogRepository } from '../../../application/ports/IAuditLogRepository';
import { AuditLog } from '../../../domain/entities/AuditLog';
import { AuditLogNotFoundError } from '../../../domain/errors/AuditErrors';

describe('ManageAuditLogs Use Cases', () => {
  let mockRepo: jest.Mocked<IAuditLogRepository>;

  const mockLog = new AuditLog(
    'log1',
    'user1',
    'USER_LOGIN',
    'User logged in successfully',
    '192.168.1.1',
    new Date('2025-01-15')
  );

  const mockLog2 = new AuditLog(
    'log2',
    'user2',
    'REGISTRAR_IMPORT',
    'Imported 500 graduate records',
    '10.0.0.1',
    new Date('2025-01-16')
  );

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByUserId: jest.fn(),
      findByAction: jest.fn(),
      create: jest.fn(),
      deleteOlderThan: jest.fn(),
    };
  });

  // ─── CreateAuditLog ────────────────────────────────────────────

  describe('CreateAuditLog', () => {
    it('should create an audit log entry successfully', async () => {
      mockRepo.create.mockResolvedValue(mockLog);

      const useCase = new CreateAuditLog(mockRepo);
      const result = await useCase.execute('user1', 'USER_LOGIN', 'User logged in successfully', '192.168.1.1');

      expect(result).toEqual(mockLog);
      expect(mockRepo.create).toHaveBeenCalledWith({
        userId: 'user1',
        action: 'USER_LOGIN',
        details: 'User logged in successfully',
        ipAddress: '192.168.1.1',
      });
    });

    it('should create an audit log without userId (system actions)', async () => {
      const systemLog = new AuditLog('log3', null, 'SYSTEM_CLEANUP', 'Expired jobs removed', null, new Date());
      mockRepo.create.mockResolvedValue(systemLog);

      const useCase = new CreateAuditLog(mockRepo);
      const result = await useCase.execute(null, 'SYSTEM_CLEANUP', 'Expired jobs removed', null);

      expect(result).toEqual(systemLog);
      expect(mockRepo.create).toHaveBeenCalledWith({
        userId: null,
        action: 'SYSTEM_CLEANUP',
        details: 'Expired jobs removed',
        ipAddress: null,
      });
    });
  });

  // ─── GetAllAuditLogs ──────────────────────────────────────────

  describe('GetAllAuditLogs', () => {
    it('should return all audit logs', async () => {
      mockRepo.findAll.mockResolvedValue([mockLog, mockLog2]);

      const useCase = new GetAllAuditLogs(mockRepo);
      const result = await useCase.execute();

      expect(result).toEqual([mockLog, mockLog2]);
      expect(result).toHaveLength(2);
      expect(mockRepo.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no logs exist', async () => {
      mockRepo.findAll.mockResolvedValue([]);

      const useCase = new GetAllAuditLogs(mockRepo);
      const result = await useCase.execute();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  // ─── GetAuditLogsByUser ───────────────────────────────────────

  describe('GetAuditLogsByUser', () => {
    it('should return audit logs for a specific user', async () => {
      mockRepo.findByUserId.mockResolvedValue([mockLog]);

      const useCase = new GetAuditLogsByUser(mockRepo);
      const result = await useCase.execute('user1');

      expect(result).toEqual([mockLog]);
      expect(mockRepo.findByUserId).toHaveBeenCalledWith('user1');
    });
  });

  // ─── GetAuditLogsByAction ─────────────────────────────────────

  describe('GetAuditLogsByAction', () => {
    it('should return audit logs filtered by action type', async () => {
      mockRepo.findByAction.mockResolvedValue([mockLog2]);

      const useCase = new GetAuditLogsByAction(mockRepo);
      const result = await useCase.execute('REGISTRAR_IMPORT');

      expect(result).toEqual([mockLog2]);
      expect(mockRepo.findByAction).toHaveBeenCalledWith('REGISTRAR_IMPORT');
    });
  });

  // ─── GetAuditLogById ──────────────────────────────────────────

  describe('GetAuditLogById', () => {
    it('should return a single audit log by id', async () => {
      mockRepo.findById.mockResolvedValue(mockLog);

      const useCase = new GetAuditLogById(mockRepo);
      const result = await useCase.execute('log1');

      expect(result).toEqual(mockLog);
      expect(mockRepo.findById).toHaveBeenCalledWith('log1');
    });

    it('should throw AuditLogNotFoundError if log does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      const useCase = new GetAuditLogById(mockRepo);
      await expect(useCase.execute('nonexistent')).rejects.toThrow(AuditLogNotFoundError);
    });
  });

  // ─── PurgeOldAuditLogs ────────────────────────────────────────

  describe('PurgeOldAuditLogs', () => {
    it('should delete audit logs older than the given number of days', async () => {
      mockRepo.deleteOlderThan.mockResolvedValue(42);

      const useCase = new PurgeOldAuditLogs(mockRepo);
      const result = await useCase.execute(90);

      expect(result).toBe(42);
      expect(mockRepo.deleteOlderThan).toHaveBeenCalledWith(expect.any(Date));
    });

    it('should return 0 when no old logs exist', async () => {
      mockRepo.deleteOlderThan.mockResolvedValue(0);

      const useCase = new PurgeOldAuditLogs(mockRepo);
      const result = await useCase.execute(30);

      expect(result).toBe(0);
    });
  });
});
