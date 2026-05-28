import React from 'react';
import { VerificationRequest } from '../types/registrar.types';
import toast from 'react-hot-toast';

interface VerificationTabProps {
  verifications: VerificationRequest[];
  onVerify: (id: number, status: 'Approved' | 'Rejected') => void;
}

export const VerificationTab: React.FC<VerificationTabProps> = ({ verifications, onVerify }) => {
  
  const handleAction = (id: number, status: 'Approved' | 'Rejected', name: string) => {
    onVerify(id, status);
    toast.success(`Registration request for ${name} marked as ${status}.`);
  };

  return (
    <div className="bg-white border border-gray-200/60 rounded-3xl p-8 shadow-sm">
      <div className="pb-6 border-b border-gray-150 mb-6">
        <h3 className="text-2xl font-extrabold text-gray-900">Alumni Registration Approvals</h3>
        <p className="text-sm text-gray-600">Cross-reference alumni sign-ups with official graduation logs prior to dashboard activation</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-150 text-gray-500 font-bold uppercase tracking-wider">
              <th className="pb-3 pr-2">Student ID</th>
              <th className="pb-3 pr-2">Candidate Details</th>
              <th className="pb-3 pr-2">Academic Department</th>
              <th className="pb-3 pr-2">Request Type</th>
              <th className="pb-3 pr-2">Request Date</th>
              <th className="pb-3 text-right">Verification Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {verifications.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50/50">
                <td className="py-4 font-mono font-bold pr-2">{req.studentId}</td>
                <td className="py-4 pr-2">
                  <p className="font-bold text-gray-900">{req.fullName}</p>
                  <p className="text-[10px] text-gray-500">{req.email}</p>
                </td>
                <td className="py-4 text-xs font-bold text-astu-navy pr-2">
                  {req.department} • Class of {req.graduationYear}
                </td>
                <td className="py-4 pr-2">
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase rounded">
                    {req.type}
                  </span>
                </td>
                <td className="py-4 text-gray-500 pr-2">{req.requestDate}</td>
                <td className="py-4 text-right">
                  {req.status === 'Pending' ? (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleAction(req.id, 'Approved', req.fullName)}
                        className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-[10px] font-bold hover:bg-green-100"
                      >
                        Confirm Graduation
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'Rejected', req.fullName)}
                        className="px-3 py-1.5 bg-red-50 border border-red-200 text-astu-red rounded-lg text-[10px] font-bold hover:bg-red-100"
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                      req.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {req.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {verifications.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400 italic">No registration verifications pending.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
