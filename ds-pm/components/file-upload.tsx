// components/file-upload.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import Image from 'next/image'

type FileUploadProps = {
  onUpload: (urls: string[]) => void
  onRemove: (url: string) => void
  initialFiles?: string[]
}

export function FileUpload({ onUpload, onRemove, initialFiles = [] }: FileUploadProps) {
  const [files, setFiles] = useState<string[]>(initialFiles)
  const [isUploading, setIsUploading] = useState(false)

  // Sync initialFiles with internal state
  useEffect(() => {
    setFiles(initialFiles)
  }, [initialFiles])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsUploading(true)
      const newUrls = acceptedFiles.map(file => URL.createObjectURL(file))
      const updatedFiles = [...files, ...newUrls]
      setFiles(updatedFiles)
      onUpload(updatedFiles) // Send all current files including new ones
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }, [files, onUpload])

  const handleRemove = (url: string) => {
    const updatedFiles = files.filter(file => file !== url)
    setFiles(updatedFiles)
    onRemove(url)
    onUpload(updatedFiles) // Notify parent of updated files array
    URL.revokeObjectURL(url)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 5 * 1024 * 1024 // 5MB
  })

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
          {isDragActive ? "Drop images here" : "Drag & drop property images (optional)"}
        </p>
        <Button type="button" variant="outline" className="mt-2">
          Browse Files
        </Button>
      </div>
      
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((url) => (
            <div key={url} className="relative group">
              <Image
                src={url}
                alt="Property image preview"
                className="h-24 w-full object-cover rounded"
                width={200}
                height={200}
                // Add this if using blob URLs
                unoptimized={url.startsWith('blob:')}
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}