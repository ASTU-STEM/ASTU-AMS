import React from 'react';
import { Inbox } from 'lucide-react';

interface DepartmentBackendGapNoticeProps {
  title: string;
  description: string;
  darkMode?: boolean;
  icon?: string;
}

const DepartmentBackendGapNotice: React.FC<DepartmentBackendGapNoticeProps> = ({
  title,
  description,
  darkMode = false,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border p-10 text-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/80'}`}>
      <span className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
        <Inbox className="h-7 w-7" />
      </span>
      <h2 className={`mt-4 text-lg font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      <p className={`mx-auto mt-2 max-w-2xl text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {description}
      </p>
    </div>
  );
};

export default DepartmentBackendGapNotice;
