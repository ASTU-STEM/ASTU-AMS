import {
  BatchImportRecord,
  BatchImportResult,
  DataExportRequest,
  DocumentProcessingRequest,
  GraduateRecord,
  RegistrarDashboardSummary,
  VerificationRequest
} from '../types';
import {
  getDocumentRequests,
  getGraduates,
  getVerifications,
  saveDocumentRequests,
  saveGraduates,
  saveVerifications
} from './mockRegistrarData';

const nextId = <T extends { id: number }>(items: T[]) =>
  items.length === 0 ? 1 : Math.max(...items.map((item) => item.id)) + 1;

const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const registrarService = {
  getWorkspace() {
    return {
      graduates: getGraduates(),
      verifications: getVerifications(),
      documents: getDocumentRequests()
    };
  },

  getDashboardSummary(): RegistrarDashboardSummary {
    const graduates = getGraduates();
    const verifications = getVerifications();
    const documents = getDocumentRequests();
    const verifiedGraduateRecords = graduates.filter((graduate) => graduate.identityVerified).length;

    return {
      totalGraduateRecords: graduates.length,
      verifiedGraduateRecords,
      pendingVerifications: verifications.filter((request) => request.status === 'Pending').length,
      pendingDocuments: documents.filter((request) => request.status === 'Pending').length,
      activeRecords: graduates.filter((graduate) => graduate.status === 'Active').length,
      archivedRecords: graduates.filter((graduate) => graduate.status === 'Archived').length,
      verificationRate: graduates.length > 0 ? Math.round((verifiedGraduateRecords / graduates.length) * 100) : 0
    };
  },

  addGraduate(input: Omit<GraduateRecord, 'id' | 'identityVerified' | 'status'>): {
    graduates: GraduateRecord[];
    verifications: VerificationRequest[];
  } {
    const graduates = getGraduates();
    const verifications = getVerifications();
    const newGraduate: GraduateRecord = {
      id: nextId(graduates),
      ...input,
      identityVerified: false,
      status: 'Active'
    };
    const newVerification: VerificationRequest = {
      id: nextId(verifications),
      studentId: input.studentId,
      fullName: input.fullName,
      email: input.email,
      department: input.department,
      graduationYear: input.graduationYear,
      type: 'Alumni Registration',
      status: 'Pending',
      requestDate: today()
    };

    const updatedGraduates = [newGraduate, ...graduates];
    const updatedVerifications = [newVerification, ...verifications];
    saveGraduates(updatedGraduates);
    saveVerifications(updatedVerifications);

    return { graduates: updatedGraduates, verifications: updatedVerifications };
  },

  importBatch(records: BatchImportRecord[]): BatchImportResult {
    const graduates = getGraduates();
    const existingIds = new Set(graduates.map((graduate) => graduate.studentId));
    const acceptedRecords = records.filter((record) => !existingIds.has(record.studentId));
    const duplicateCount = records.length - acceptedRecords.length;
    const startId = nextId(graduates);
    const importedGraduates: GraduateRecord[] = acceptedRecords.map((record, index) => ({
      id: startId + index,
      ...record,
      identityVerified: true,
      status: 'Active'
    }));
    const updatedGraduates = [...importedGraduates, ...graduates];
    saveGraduates(updatedGraduates);

    return {
      accepted: importedGraduates.length,
      duplicates: duplicateCount,
      rejected: 0,
      records: updatedGraduates
    };
  },

  updateGraduate(updatedGraduate: GraduateRecord): GraduateRecord[] {
    const graduates = getGraduates().map((graduate) =>
      graduate.id === updatedGraduate.id ? updatedGraduate : graduate
    );
    saveGraduates(graduates);
    return graduates;
  },

  archiveGraduate(graduateId: number): GraduateRecord[] {
    const graduates = getGraduates().map((graduate) =>
      graduate.id === graduateId ? { ...graduate, status: 'Archived' as const } : graduate
    );
    saveGraduates(graduates);
    return graduates;
  },

  resolveVerification(requestId: number, status: 'Approved' | 'Rejected'): {
    graduates: GraduateRecord[];
    verifications: VerificationRequest[];
  } {
    const verifications = getVerifications();
    const targetRequest = verifications.find((request) => request.id === requestId);
    const updatedVerifications = verifications.map((request) =>
      request.id === requestId ? { ...request, status } : request
    );
    const updatedGraduates = status === 'Approved' && targetRequest
      ? getGraduates().map((graduate) =>
        graduate.studentId === targetRequest.studentId ? { ...graduate, identityVerified: true } : graduate
      )
      : getGraduates();

    saveVerifications(updatedVerifications);
    saveGraduates(updatedGraduates);
    return { graduates: updatedGraduates, verifications: updatedVerifications };
  },

  processDocument(requestId: number, status: DocumentProcessingRequest['status']): DocumentProcessingRequest[] {
    const documents = getDocumentRequests().map((request) =>
      request.id === requestId ? { ...request, status } : request
    );
    saveDocumentRequests(documents);
    return documents;
  },

  createExportManifest(request: DataExportRequest) {
    return {
      id: Date.now(),
      ...request,
      requestedAt: new Date().toISOString(),
      status: 'Ready' as const
    };
  },

  saveGraduates,
  saveVerifications,
  saveDocuments: saveDocumentRequests
};
