'use client'

import { useState, useCallback, useRef } from 'react'
import { uploadFileWithProgress, type UploadProgressEvent } from '@/lib/upload-client'

export type FileUploadStatus = 'pending' | 'uploading' | 'complete' | 'error'

export interface FileUploadItem {
  id: string
  file: File
  progress: number
  status: FileUploadStatus
  url: string | null
  error: string | null
}

interface UseFileUploadReturn {
  items: FileUploadItem[]
  isUploading: boolean
  overallProgress: number
  uploadFiles: (files: File[]) => Promise<Map<string, string>>
  reset: () => void
  abort: () => void
}

const MAX_CONCURRENT = 3

export function useFileUpload(): UseFileUploadReturn {
  const [items, setItems] = useState<FileUploadItem[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  const updateItem = (id: string, updates: Partial<FileUploadItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }

  const uploadSingle = async (
    item: FileUploadItem,
    signal: AbortSignal
  ): Promise<{ id: string; url: string }> => {
    updateItem(item.id, { status: 'uploading', progress: 0 })

    try {
      const url = await uploadFileWithProgress(
        item.file,
        (event: UploadProgressEvent) => {
          updateItem(item.id, { progress: event.percent })
        },
        signal
      )

      updateItem(item.id, { status: 'complete', progress: 100, url })
      return { id: item.id, url }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Upload failed'
      if (err instanceof DOMException && err.name === 'AbortError') {
        updateItem(item.id, { status: 'error', error: 'Cancelled' })
      } else {
        updateItem(item.id, { status: 'error', error })
      }
      throw err
    }
  }

  const uploadFiles = useCallback(async (files: File[]): Promise<Map<string, string>> => {
    const controller = new AbortController()
    abortControllerRef.current = controller

    const newItems: FileUploadItem[] = files.map((file, i) => ({
      id: `upload-${Date.now()}-${i}`,
      file,
      progress: 0,
      status: 'pending' as const,
      url: null,
      error: null,
    }))

    setItems(newItems)
    const results = new Map<string, string>()

    // Upload in batches of MAX_CONCURRENT
    for (let i = 0; i < newItems.length; i += MAX_CONCURRENT) {
      if (controller.signal.aborted) break

      const batch = newItems.slice(i, i + MAX_CONCURRENT)
      const batchResults = await Promise.allSettled(
        batch.map((item) => uploadSingle(item, controller.signal))
      )

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.set(result.value.id, result.value.url)
        }
      }
    }

    abortControllerRef.current = null
    return results
  }, [])

  const reset = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setItems([])
  }, [])

  const abort = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }, [])

  const isUploading = items.some((item) => item.status === 'uploading' || item.status === 'pending')

  const overallProgress =
    items.length === 0
      ? 0
      : Math.round(
          items.reduce((acc, item) => acc + item.progress * item.file.size, 0) /
            items.reduce((acc, item) => acc + item.file.size, 0)
        )

  return { items, isUploading, overallProgress, uploadFiles, reset, abort }
}
