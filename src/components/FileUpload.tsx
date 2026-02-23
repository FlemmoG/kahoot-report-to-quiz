import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { FileSpreadsheet } from 'lucide-react';
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
      toast.error('Please upload only .xlsx files.');
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
        "w-full p-10 sm:p-14 border-2 border-dashed rounded-2xl text-center transition-all duration-200 cursor-pointer group relative overflow-hidden",
        isDragging 
          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 scale-[1.02]" 
          : "border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
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
      
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
        <div className={cn(
          "p-4 rounded-full mb-6 transition-colors duration-300",
          isDragging ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-500"
        )}>
          <FileSpreadsheet className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={1.5} />
        </div>
        
        <h3 className={cn(
          "text-lg sm:text-xl font-semibold mb-2 transition-colors",
          isDragging ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
        )}>
          {isDragging ? "Drop files here..." : "Select Excel Files"}
        </h3>
        
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-[250px] mx-auto leading-relaxed">
          Drag and drop your <span className="font-medium text-slate-700 dark:text-slate-300">.xlsx</span> files here or click to browse
        </p>
      </div>
      
      {/* Decorative background blob */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 transition-opacity duration-500",
        isDragging && "opacity-100"
      )} />
    </div>
  );
}
