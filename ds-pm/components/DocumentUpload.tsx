"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { FileIcon } from "lucide-react";

type DocumentUploadProps = {
  onUpload: (urls: string[]) => void;
  onRemove: (url: string) => void;
  initialFiles?: string[];
  maxSize?: number;
};

export function DocumentUpload({ 
  onUpload, 
  onRemove, 
  initialFiles = [], 
  maxSize = 25 * 1024 * 1024 
}: DocumentUploadProps) {
  const [files, setFiles] = useState<string[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsUploading(true);
      const newUrls = acceptedFiles.map(file => URL.createObjectURL(file));
      const updatedFiles = [...files, ...newUrls];
      setFiles(updatedFiles);
      onUpload(updatedFiles);
    } catch (error) {
      console.error('Document upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }, [files, onUpload]);

  const handleRemove = (url: string) => {
    const updatedFiles = files.filter(file => file !== url);
    setFiles(updatedFiles);
    onRemove(url);
    onUpload(updatedFiles);
    URL.revokeObjectURL(url);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    maxSize,
    multiple: true,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-muted'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <FileIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive 
              ? "Drop documents here" 
              : "Drag & drop documents, or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, DOC/DOCX, XLS/XLSX, CSV (Max {maxSize/1024/1024}MB)
          </p>
          <Button type="button" variant="outline" className="mt-2">
            Select Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {files.map((url) => (
            <div key={url} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2 truncate">
                <FileIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-sm">{url.split('/').pop()}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(url)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}