import React from 'react';

export default function HelpCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Help Center</h2>
        <p>Help content coming soon.</p>
        <button onClick={onClose} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Close</button>
      </div>
    </div>
  );
}
