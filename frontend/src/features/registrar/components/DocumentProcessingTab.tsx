import React from 'react';
import { DocumentProcessingRequest } from '../types/registrar.types';
import toast from 'react-hot-toast';

interface DocumentProcessingTabProps {
  documents: DocumentProcessingRequest[];
  onProcessDocument: (id: number, status: 'Approved' | 'Rejected' | 'In Progress') => void;
}

export const DocumentProcessingTab: React.FC<DocumentProcessingTabProps> = ({ documents, onProcessDocument }) => {
  
  const handleUpdate = (id: number, status: 'Approved' | 'Rejected' | 'In Progress', name: string) => {
    onProcessDocument(id, status);
    toast.success(`Document request for ${name} marked as ${status}.`);
  };

  const getStatusBadge = (status: DocumentProcessingRequest['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 border border-amber-200';
    }
  };

  return (
    <div className="bg-white border border-gray-200/60 rounded-3xl p-8 shadow-sm">
      <div className="pb-6 border-b border-gray-150 mb-6">
        <h3 className="text-2xl font-extrabold text-gray-900">Document Processing Queue</h3>
        <p className="text-sm text-gray-600">Review and authorize academic transcripts, degree credentials, and language certification requests</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-150 text-gray-500 font-bold uppercase tracking-wider">
              <th className="pb-3 pr-2">Student ID</th>
              <th className="pb-3 pr-2">Graduate Name</th>
              <th className="pb-3 pr-2">Requested Document</th>
              <th className="pb-3 pr-2">Destination Agency</th>
              <th className="pb-3 pr-2">Date Requested</th>
              <th className="pb-3 pr-2">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50/50">
                <td className="py-4 font-mono font-bold pr-2">{doc.studentId}</td>
                <td className="py-4 font-bold text-gray-900 pr-2">{doc.fullName}</td>
                <td className="py-4 font-semibold text-astu-navy pr-2">{doc.documentType}</td>
                <td className="py-4 text-gray-600 pr-2">{doc.destination}</td>
                <td className="py-4 text-gray-500 pr-2">{doc.requestDate}</td>
                <td className="py-4 pr-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${getStatusBadge(doc.status)}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    {doc.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdate(doc.id, 'In Progress', doc.fullName)}
                        className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded text-[10px] font-bold"
                      >
                        Process
                      </button>
                    )}
                    {doc.status !== 'Approved' && (
                      <button
                        onClick={() => handleUpdate(doc.id, 'Approved', doc.fullName)}
                        className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded text-[10px] font-bold"
                      >
                        Approve
                      </button>
                    )}
                    {doc.status !== 'Rejected' && (
                      <button
                        onClick={() => handleUpdate(doc.id, 'Rejected', doc.fullName)}
                        className="px-2 py-1 bg-red-50 border border-red-200 text-astu-red rounded text-[10px] font-bold"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400 italic">No document processing requests registered.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
