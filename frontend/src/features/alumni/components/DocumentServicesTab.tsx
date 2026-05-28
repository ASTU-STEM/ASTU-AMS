import React, { useState } from 'react';
import { DocumentRequest } from '../types/alumni.types';
import toast from 'react-hot-toast';

interface DocumentServicesTabProps {
  documentRequests: DocumentRequest[];
  onRequestDocument: (type: DocumentRequest['type'], notes?: string) => void;
}

export const DocumentServicesTab: React.FC<DocumentServicesTabProps> = ({
  documentRequests,
  onRequestDocument,
}) => {
  const [docType, setDocType] = useState<DocumentRequest['type']>('Official Transcript');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestDocument(docType, reason);
    setReason('');
    toast.success(`${docType} requested successfully! Track status in the table below.`);
  };

  const getStatusBadge = (status: DocumentRequest['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Dispatched':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 border border-amber-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Intro Banner */}
      <section className="bg-gradient-to-r from-[#003366] via-slate-900 to-astu-navy rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="max-w-3xl relative z-10 space-y-4">
          <span className="px-3 py-1 bg-white/15 text-[#FFD700] text-xs font-bold uppercase tracking-wider rounded-full">ASTU Registrar Services</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Digital Document Services Portal 📑</h2>
          <p className="text-md opacity-90 leading-relaxed">
            Request verified official academic transcripts, degree verification files, or temporary certificates online. Your documents are verified and dispatched securely to employers, international credential agencies, or universities.
          </p>
        </div>
      </section>

      {/* Main Grid: Request Form (left) & Tracking Table (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Request Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Request New Document</h3>
              <p className="text-xs text-gray-600">Ensure your graduation batch details are verified in your profile before requesting.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocumentRequest['type'])}
                  className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy focus:bg-white transition-all font-semibold text-gray-700"
                >
                  <option value="Official Transcript">Official Academic Transcript</option>
                  <option value="Degree Verification">Official Degree Verification</option>
                  <option value="Temporary Certificate">Temporary Graduation Certificate</option>
                  <option value="English Medium Certificate">English Medium Instruction Certificate</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reason / Delivery Address</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide recipient details, mailing address, or purpose (e.g. WES evaluation, employer HR email)..."
                  className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy focus:bg-white transition-all h-28 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-astu-navy hover:bg-astu-navy/90 text-white rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all shadow-md hover:scale-102"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>

        {/* Right: Request History Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Request History & Status Tracking</h3>
              <p className="text-sm text-gray-600">Track registrar validation, signature approvals, and dispatch references.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 pr-2">Document ID</th>
                    <th className="pb-3 pr-2">Document Type</th>
                    <th className="pb-3 pr-2">Requested Date</th>
                    <th className="pb-3 pr-2">Approval Status</th>
                    <th className="pb-3">Registrar Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {documentRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pr-2 font-bold text-astu-navy">ASTU-DOC-{req.id + 1000}</td>
                      <td className="py-4 pr-2 font-bold text-gray-900">{req.type}</td>
                      <td className="py-4 pr-2 text-gray-600">{req.requestDate}</td>
                      <td className="py-4 pr-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-gray-600 leading-relaxed max-w-xs">{req.notes || 'Under registrar validation.'}</td>
                    </tr>
                  ))}
                  {documentRequests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 italic">No document requests logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
