"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";

type DocumentUploadProps = {
  onUpload: (urls: string[]) => void;
  onRemove: (url: string) => void;
  initialFiles?: string[];
};

export function DocumentUpload({ onUpload, onRemove, initialFiles = [] }: DocumentUploadProps) {
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
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-muted'
        } ${isUploading ? 'opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        <p className="text-muted-foreground">
          {isDragActive ? "Drop documents here" : "Drag & drop property documents (e.g. images, PDFs, Word, Excel)"}
        </p>
        <Button type="button" variant="outline" className="mt-2">
          Browse Files
        </Button>
      </div>
    </div>
  );
}
