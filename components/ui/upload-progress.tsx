'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import type { FileUploadItem } from '@/lib/hooks/use-file-upload'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

const statusColors: Record<string, string> = {
  pending: 'bg-gray-400',
  uploading: 'bg-blue-500',
  complete: 'bg-green-500',
  error: 'bg-red-500',
}

interface UploadProgressProps {
  item: FileUploadItem
  onCancel?: () => void
}

export function UploadProgress({ item, onCancel }: UploadProgressProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm truncate max-w-[200px]" title={item.file.name}>
            {item.file.name}
          </span>
          <span className="text-xs text-gray-500 ml-2 shrink-0">
            {formatFileSize(item.file.size)}
            {item.status === 'uploading' && ` · ${item.progress}%`}
            {item.status === 'complete' && ' · Done'}
            {item.status === 'error' && ` · ${item.error}`}
          </span>
        </div>
        <ProgressPrimitive.Root
          className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100"
        >
          <ProgressPrimitive.Indicator
            className={cn(
              'h-full transition-all duration-300 ease-in-out rounded-full',
              statusColors[item.status]
            )}
            style={{ width: `${item.progress}%` }}
          />
        </ProgressPrimitive.Root>
      </div>
      {(item.status === 'uploading' || item.status === 'pending') && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 shrink-0"
          title="Cancel upload"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

interface UploadProgressListProps {
  items: FileUploadItem[]
  overallProgress: number
  onCancel?: () => void
}

export function UploadProgressList({ items, overallProgress, onCancel }: UploadProgressListProps) {
  if (items.length === 0) return null

  const isUploading = items.some((i) => i.status === 'uploading' || i.status === 'pending')

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Uploading files ({items.filter((i) => i.status === 'complete').length}/{items.length})
        </span>
        {isUploading && (
          <span className="text-xs text-gray-500">{overallProgress}% overall</span>
        )}
      </div>

      {isUploading && (
        <ProgressPrimitive.Root className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <ProgressPrimitive.Indicator
            className="h-full bg-blue-500 transition-all duration-300 ease-in-out rounded-full"
            style={{ width: `${overallProgress}%` }}
          />
        </ProgressPrimitive.Root>
      )}

      <div className="max-h-48 overflow-y-auto">
        {items.map((item) => (
          <UploadProgress key={item.id} item={item} onCancel={onCancel} />
        ))}
      </div>
    </div>
  )
}
