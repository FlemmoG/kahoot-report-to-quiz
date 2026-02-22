import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
}

export function FileUpload({ onFilesSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(f => f.name.endsWith('.xlsx'));
    
    if (validFiles.length > 0) {
      onFilesSelect(validFiles);
    } else {
      alert('Please upload only .xlsx files.');
    }
  }, [onFilesSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelect(Array.from(files));
    }
  }, [onFilesSelect]);

  return (
    <div
      className={cn(
        "w-full max-w-md p-12 border-2 border-dashed rounded-2xl text-center transition-colors cursor-pointer",
        isDragging ? "border-blue-500 bg-blue-50/10" : "border-gray-300 hover:border-gray-400"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        accept=".xlsx"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />
      <UploadCloud className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-semibold mb-2">Upload Kahoot Excel</h3>
      <p className="text-sm text-gray-500">
        Drag and drop your .xlsx files here or click to select
      </p>
    </div>
  );
}
