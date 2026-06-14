import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
  allowedTypes?: string[];
  disabled?: boolean;
}

export default function FileUpload({
  files,
  onChange,
  maxFiles = 3,
  maxSizeMb = 5,
  allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
  disabled = false
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (newFiles: File[]) => {
    setErrorMsg(null);
    if (files.length + newFiles.length > maxFiles) {
      setErrorMsg(`You can upload a maximum of ${maxFiles} files.`);
      return;
    }

    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    for (const file of newFiles) {
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg(`${file.name} is not a supported file type. Only PDF, JPG, PNG are allowed.`);
        return;
      }
      if (file.size > maxSizeBytes) {
        setErrorMsg(`${file.name} exceeds the ${maxSizeMb}MB size limit.`);
        return;
      }
      validFiles.push(file);
    }

    onChange([...files, ...validFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setErrorMsg(null);
    onChange(files.filter((_, i) => i !== index));
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`border-2 border-dashed rounded-lg p-6 hover:bg-slate-50 transition-all relative flex flex-col items-center justify-center cursor-pointer ${
          dragActive ? 'border-astu-navy bg-slate-50' : 'border-outline-variant'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          disabled={disabled || files.length >= maxFiles}
          className="hidden"
          aria-label="Upload files"
        />
        <Upload className="h-8 w-8 text-on-surface-variant/70 mb-2" />
        <p className="text-xs font-semibold text-on-surface">
          Click or drag files here to upload
        </p>
        <p className="text-[10px] text-on-surface-variant/70 mt-1">
          PDF, JPG, PNG files are allowed (Max {maxFiles} files, up to {maxSizeMb}MB each)
        </p>
      </div>

      {errorMsg && (
        <div className="text-xs text-astu-red flex items-center gap-1.5 mt-1.5 font-medium" role="alert">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Uploaded File List */}
      {files.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-xs font-semibold text-on-surface-variant">
            Uploaded Files ({files.length}/{maxFiles}):
          </p>
          <div className="space-y-1 bg-slate-50/50 p-2 rounded-lg border border-outline-variant/60">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between border border-outline-variant bg-white rounded-md p-2.5 text-xs shadow-sm"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-astu-navy flex-shrink-0" />
                  <span className="truncate font-medium text-on-surface">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-on-surface-variant flex-shrink-0 font-normal">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-on-surface-variant hover:text-astu-red p-1 rounded transition-colors"
                  disabled={disabled}
                  aria-label={`Remove file ${file.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
