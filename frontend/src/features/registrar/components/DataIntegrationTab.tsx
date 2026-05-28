import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface DataIntegrationTabProps {
  onBatchInsert: (records: any[]) => void;
}

export const DataIntegrationTab: React.FC<DataIntegrationTabProps> = ({ onBatchInsert }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<{
    total: number;
    valid: number;
    duplicates: number;
    errors: string[];
    records: any[];
  } | null>(null);

  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'done'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setValidationReport(null);
      setProcessingStatus('idle');
      toast.success(`Loaded file: ${file.name}`);
    }
  };

  const handleRunValidation = () => {
    if (!csvFile) return;
    setIsValidating(true);

    setTimeout(() => {
      // High fidelity validation simulation
      const mockRecords = [
        { studentId: 'UG/19082/14', fullName: 'Solomon Kebede', email: 'solomon.k@astu.edu.et', department: 'Computer Science and Engineering', graduationYear: '2024', cgpa: '3.72' },
        { studentId: 'UG/12839/14', fullName: 'Abebe Bikila', email: 'abebe.b@gmail.com', department: 'Computer Science and Engineering', graduationYear: '2024', cgpa: '3.78' }, // Duplicate studentId
        { studentId: 'UG/14299/14', fullName: 'Hiwot Tadesse', email: 'hiwot.t@astu.edu.et', department: 'Electrical and Computer Engineering', graduationYear: '2024', cgpa: '3.95' },
        { studentId: 'UG/18029/14', fullName: 'Mered Girma', email: 'mered.g@astu.edu.et', department: 'Chemical Engineering', graduationYear: '2024', cgpa: '2.40' } // Low CGPA / Valid anyway
      ];

      setValidationReport({
        total: 4,
        valid: 3,
        duplicates: 1,
        errors: [
          'Row 2 Error: Student ID "UG/12839/14" already exists in ASTU-SIS database (Duplicate Detected).'
        ],
        records: mockRecords
      });
      setIsValidating(false);
      toast.success('SIS validation engine check complete.');
    }, 1500);
  };

  const handleProcessBatch = () => {
    if (!validationReport) return;
    setProcessingStatus('processing');

    setTimeout(() => {
      // Filter out duplicate
      const validToInsert = validationReport.records.filter(r => r.studentId !== 'UG/12839/14');
      
      onBatchInsert(validToInsert.map(r => ({
        studentId: r.studentId,
        fullName: r.fullName,
        email: r.email,
        department: r.department,
        graduationYear: r.graduationYear,
        cgpa: r.cgpa
      })));

      setProcessingStatus('done');
      toast.success(`Successfully registered ${validToInsert.length} alumni accounts and generated activation emails!`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Excel/CSV File drop area */}
      <section className="bg-white border border-gray-200/60 rounded-3xl p-8 shadow-sm text-center">
        <h3 className="text-xl font-bold mb-2">Excel / CSV Batch Scaffolder</h3>
        <p className="text-sm text-gray-600 mb-6">Drag and drop graduate lists exported from university ERP system to auto-generate verified alumni credentials</p>

        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 max-w-lg mx-auto relative group hover:border-astu-navy/50 transition-colors">
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-3">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mx-auto group-hover:bg-astu-navy/10 group-hover:text-astu-navy transition-colors">
              <span className="material-symbols-outlined text-3xl">upload_file</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {csvFile ? csvFile.name : 'Upload Graduates Excel or CSV'}
              </p>
              <p className="text-xs text-gray-500">Supports standard SIS column layouts (Name, ID, Dept, GPA)</p>
            </div>
          </div>
        </div>

        {csvFile && processingStatus === 'idle' && (
          <button
            onClick={handleRunValidation}
            disabled={isValidating}
            className="mt-6 px-8 py-3 bg-astu-navy text-white text-xs font-bold uppercase rounded-xl hover:scale-105 transition-all shadow-md"
          >
            {isValidating ? 'Validating Data...' : 'Run Data Validation Checks'}
          </button>
        )}
      </section>

      {/* Validation Engine Results Panel */}
      {validationReport && (
        <section className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h4 className="font-bold text-md flex items-center gap-2">
              <span className="material-symbols-outlined text-astu-green font-bold">verified_user</span>
              Validation Engine Reports
            </h4>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase rounded">
              Engine Version v1.4
            </span>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center text-xs font-bold">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-500">TOTAL ATTEMPTED</p>
              <p className="text-2xl font-extrabold mt-1">{validationReport.total}</p>
            </div>
            <div className="p-4 bg-green-50 text-green-800 rounded-xl border border-green-100">
              <p className="text-green-600">VALID GRADUATES</p>
              <p className="text-2xl font-extrabold mt-1">{validationReport.valid}</p>
            </div>
            <div className="p-4 bg-red-50 text-astu-red rounded-xl border border-red-100">
              <p className="text-astu-red">DUPLICATE IDS</p>
              <p className="text-2xl font-extrabold mt-1">{validationReport.duplicates}</p>
            </div>
          </div>

          {/* Validation Warnings */}
          {validationReport.errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-astu-red flex items-center gap-1">
                <span className="material-symbols-outlined text-base">warning</span>
                Duplicates / Validation Errors Detected
              </p>
              {validationReport.errors.map((err, i) => (
                <p key={i} className="text-gray-700">{err}</p>
              ))}
            </div>
          )}

          {processingStatus === 'idle' ? (
            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={handleProcessBatch}
                className="px-6 py-3 bg-astu-green text-white text-xs font-bold uppercase rounded-xl hover:scale-105 transition-all shadow-md"
              >
                Proceed with Batch Import ({validationReport.valid} Records)
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1.5">
                  {processingStatus === 'processing' ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
                      Processing batch and sending activation emails...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-astu-green text-lg">check_circle</span>
                      Batch processing finished successfully!
                    </>
                  )}
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-astu-green h-full rounded-full transition-all duration-1000" 
                  style={{ width: processingStatus === 'processing' ? '60%' : '100%' }}
                ></div>
              </div>
            </div>
          )}
        </section>
      )}

    </div>
  );
};
