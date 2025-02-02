"use client";

import { useCallback, useState } from "react";
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsUploading(true)
      // Add your upload logic here (e.g., to Cloudinary)
      const newUrls = acceptedFiles.map(file => URL.createObjectURL(file))
      setFiles(prev => [...prev, ...newUrls])
      onUpload([...files, ...newUrls])
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }, [files, onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 5 * 1024 * 1024 // 5MB
  })

  const handleRemove = (url: string) => {
    setFiles(files.filter(file => file !== url))
    onRemove(url)
    URL.revokeObjectURL(url)
  }

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
          {isDragActive ? "Drop images here" : "Drag & drop property images"}
        </p>
        <Button type="button" variant="outline" className="mt-2">
          Browse Files
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {files.map((url) => (
          <div key={url} className="relative group">
            <Image
              src={url}
              alt="Property image"
              className="h-24 w-full object-cover rounded"
              width={200}
              height={200}
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
    </div>
  )
}