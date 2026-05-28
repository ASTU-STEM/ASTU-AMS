import React, { useState } from 'react';
import { GraduateRecord } from '../types/registrar.types';
import toast from 'react-hot-toast';

interface RecordsTabProps {
  graduates: GraduateRecord[];
  onAddGraduate: (newGrad: Omit<GraduateRecord, 'id' | 'identityVerified' | 'status'>) => void;
  onEditGraduate: (updatedGrad: GraduateRecord) => void;
  onArchiveGraduate: (id: number) => void;
  onVerifyIdentity: (id: number) => void;
}

export const RecordsTab: React.FC<RecordsTabProps> = ({
  graduates,
  onAddGraduate,
  onEditGraduate,
  onArchiveGraduate,
  onVerifyIdentity
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingGrad, setEditingGrad] = useState<GraduateRecord | null>(null);
  
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    department: 'Computer Science and Engineering',
    graduationYear: '2024',
    cgpa: ''
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.fullName || !formData.email || !formData.cgpa) {
      toast.error('Please fill out all graduate fields.');
      return;
    }

    onAddGraduate({
      studentId: formData.studentId,
      fullName: formData.fullName,
      email: formData.email,
      department: formData.department,
      graduationYear: formData.graduationYear,
      cgpa: formData.cgpa
    });

    setIsAdding(false);
    setFormData({
      studentId: '',
      fullName: '',
      email: '',
      department: 'Computer Science and Engineering',
      graduationYear: '2024',
      cgpa: ''
    });
    toast.success('Graduate profile added to SIS database!');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGrad) {
      onEditGraduate(editingGrad);
      setEditingGrad(null);
      toast.success('Graduate profile saved successfully.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header controls */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">SIS Graduate Database</h3>
          <p className="text-sm text-gray-600">Verify identity credentials, edit profiles, or archive legacy records</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingGrad(null);
          }}
          className="px-6 py-2.5 bg-astu-navy hover:bg-astu-navy/90 text-white font-bold rounded-xl shadow-md transition-all hover:scale-105 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined">{isAdding ? 'close' : 'add'}</span>
          {isAdding ? 'Cancel' : 'Add Graduate Record'}
        </button>
      </div>

      {/* Add Graduate Form */}
      {isAdding && (
        <form 
          onSubmit={handleAddSubmit}
          className="bg-white p-6 border border-gray-200/60 rounded-3xl max-w-3xl mx-auto shadow-sm space-y-6"
        >
          <h4 className="font-bold text-lg border-b pb-2">Add SIS Graduate Profile</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Student ID</label>
              <input
                type="text"
                value={formData.studentId}
                onChange={e => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl focus:outline-none"
                placeholder="e.g. UG/12839/14"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl focus:outline-none"
                placeholder="e.g. Abebe Bikila"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl focus:outline-none"
                placeholder="e.g. abebe.b@gmail.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Graduating Department</label>
              <select
                value={formData.department}
                onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl focus:outline-none font-semibold text-gray-700"
              >
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Electrical and Computer Engineering">Electrical and Computer Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Graduation Year</label>
              <select
                value={formData.graduationYear}
                onChange={e => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl focus:outline-none font-semibold text-gray-700"
              >
                <option value="2024">Class of 2024</option>
                <option value="2023">Class of 2023</option>
                <option value="2022">Class of 2022</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Final CGPA</label>
              <input
                type="text"
                value={formData.cgpa}
                onChange={e => setFormData(prev => ({ ...prev, cgpa: e.target.value }))}
                className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl focus:outline-none"
                placeholder="e.g. 3.82"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-astu-navy hover:bg-astu-navy/90 text-white rounded-xl text-xs font-bold shadow-md"
          >
            Confirm & Save Record
          </button>
        </form>
      )}

      {/* Edit Graduate Form Modal */}
      {editingGrad && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleEditSubmit}
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 space-y-6"
          >
            <div className="flex justify-between items-start pb-2 border-b">
              <div>
                <h3 className="text-lg font-bold">Edit SIS Record</h3>
                <p className="text-xs text-gray-500">Edit values for {editingGrad.fullName}</p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingGrad(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                <input
                  type="text"
                  value={editingGrad.fullName}
                  onChange={e => setEditingGrad({ ...editingGrad, fullName: e.target.value })}
                  className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                <input
                  type="email"
                  value={editingGrad.email}
                  onChange={e => setEditingGrad({ ...editingGrad, email: e.target.value })}
                  className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Graduation CGPA</label>
                <input
                  type="text"
                  value={editingGrad.cgpa}
                  onChange={e => setEditingGrad({ ...editingGrad, cgpa: e.target.value })}
                  className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Verification Status</label>
                <select
                  value={editingGrad.identityVerified ? 'true' : 'false'}
                  onChange={e => setEditingGrad({ ...editingGrad, identityVerified: e.target.value === 'true' })}
                  className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl font-semibold"
                >
                  <option value="true">Identity Verified</option>
                  <option value="false">Unverified Identity</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setEditingGrad(null)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-astu-navy text-white rounded-xl text-xs font-bold shadow-md"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Database Table view */}
      <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-150 text-gray-500 font-bold uppercase tracking-wider">
              <th className="pb-3 pr-2">Student ID</th>
              <th className="pb-3 pr-2">Full Name</th>
              <th className="pb-3 pr-2">Department</th>
              <th className="pb-3 pr-2">CGPA</th>
              <th className="pb-3 pr-2">Verification Status</th>
              <th className="pb-3 pr-2">System Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {graduates.map((grad) => (
              <tr key={grad.id} className="hover:bg-gray-50/50">
                <td className="py-4 font-mono font-bold pr-2">{grad.studentId}</td>
                <td className="py-4 pr-2">
                  <p className="font-bold text-gray-900">{grad.fullName}</p>
                  <p className="text-[10px] text-gray-500">{grad.email}</p>
                </td>
                <td className="py-4 text-xs font-bold text-astu-navy pr-2">{grad.department}</td>
                <td className="py-4 font-bold text-astu-green pr-2">{grad.cgpa}</td>
                <td className="py-4 pr-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    grad.identityVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {grad.identityVerified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td className="py-4 pr-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    grad.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {grad.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    {!grad.identityVerified && (
                      <button
                        onClick={() => onVerifyIdentity(grad.id)}
                        className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded text-[10px] font-bold"
                      >
                        Verify Identity
                      </button>
                    )}
                    <button
                      onClick={() => setEditingGrad(grad)}
                      className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded text-[10px] font-bold"
                    >
                      Edit
                    </button>
                    {grad.status === 'Active' && (
                      <button
                        onClick={() => onArchiveGraduate(grad.id)}
                        className="px-2 py-1 bg-red-50 border border-red-200 text-astu-red rounded text-[10px] font-bold"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
