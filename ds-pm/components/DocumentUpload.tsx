"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type DocumentUploadProps = {
  onUpload: (urls: string[]) => void;
  onRemove: (url: string) => void;
  initialFiles?: string[];
  maxSize?: number;
  className?: string;
};

export function DocumentUpload({ 
  onUpload, 
  onRemove, 
  initialFiles = [], 
  maxSize = 25 * 1024 * 1024,
  className = ""
}: DocumentUploadProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setFiles(initialFiles.filter(url => typeof url === 'string'));
  }, [initialFiles]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsUploading(true);
      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'document');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        
        return result.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFiles(prev => [...prev, ...uploadedUrls]);
      onUpload(uploadedUrls);
      toast.success('Documents uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const handleRemove = (url: string) => {
    const updatedFiles = files.filter(file => file !== url);
    setFiles(updatedFiles);
    onRemove(url);
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
    <div className={cn("space-y-4", className)}>
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
            url && (
              <div key={url} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3 truncate">
                  <FileIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:underline"
                  >
                    <p className="text-sm font-medium truncate">
                      {url.split('/').pop() || 'Document'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {url}
                    </p>
                  </a>
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
            )
          ))}
        </div>
      )}
    </div>
  );
}