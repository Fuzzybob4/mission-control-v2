"use client"

import { useState, useCallback } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Upload, File, X, Folder, Image as ImageIcon, FileText, Archive } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  businessUnit: "lone-star" | "redfox" | "heroes"
  onFilesUploaded?: (files: File[]) => void
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
}

export function FileUploadWidget({ businessUnit, onFilesUploaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const businessNames = {
    "lone-star": "Lone Star Lighting",
    "redfox": "RedFox CRM",
    "heroes": "Heroes of the Meta"
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    processFiles(files)
  }, [])

  const processFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date()
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
    onFilesUploaded?.(files)
  }

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
    if (type.includes("zip") || type.includes("archive")) return <Archive className="w-4 h-4" />
    if (type.includes("pdf") || type.includes("text")) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <GlassCard className="mb-6">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Assets: {businessNames[businessUnit]}</h3>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Upload logos, photos, v0 exports, contracts
        </p>
      </div>

      {/* Drop Zone */}
      <div className="p-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
            isDragging
              ? "border-blue-400 bg-blue-500/10"
              : "border-white/20 hover:border-white/40 hover:bg-white/5"
          )}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-300">Drop files here or click to browse</p>
          <p className="text-xs text-gray-500 mt-1">
            Supports: images, PDFs, ZIP files
          </p>
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id={`file-upload-${businessUnit}`}
          />
          <label
            htmlFor={`file-upload-${businessUnit}`}
            className="inline-block mt-3 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-500/30 transition-colors"
          >
            Choose Files
          </label>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Uploaded Files</p>
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-blue-500/20 text-blue-400">
                    {getFileIcon(file.type)}
                  </div>
                  <div>
                    <p className="text-sm text-white truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
