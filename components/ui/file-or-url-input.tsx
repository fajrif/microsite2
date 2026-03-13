'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, Upload } from 'lucide-react'

interface FileOrUrlInputProps {
    id: string
    label: string
    accept?: string
    disabled?: boolean
    currentUrl?: string | null
    onFileChange: (file: File | null) => void
    onUrlChange: (url: string) => void
    directUrl?: string
    preview?: React.ReactNode
}

export function FileOrUrlInput({
    id,
    label,
    accept,
    disabled,
    currentUrl,
    onFileChange,
    onUrlChange,
    directUrl = '',
    preview,
}: FileOrUrlInputProps) {
    const [mode, setMode] = useState<'file' | 'url'>(directUrl ? 'url' : 'file')

    // Sync mode when directUrl prop changes externally (e.g. component reused across sample indices)
    useEffect(() => {
        if (directUrl) setMode('url')
    }, [directUrl])

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label>{label}</Label>
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => { setMode('file'); onUrlChange('') }}
                        className={`p-1 rounded text-xs flex items-center gap-1 ${mode === 'file' ? 'bg-gray-200 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                        disabled={disabled}
                        title="Upload file"
                    >
                        <Upload size={12} />
                        File
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('url'); onFileChange(null) }}
                        className={`p-1 rounded text-xs flex items-center gap-1 ${mode === 'url' ? 'bg-gray-200 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                        disabled={disabled}
                        title="Paste URL"
                    >
                        <Link size={12} />
                        URL
                    </button>
                </div>
            </div>

            {mode === 'file' ? (
                <Input
                    id={id}
                    type="file"
                    accept={accept}
                    onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                    disabled={disabled}
                />
            ) : (
                <Input
                    id={`${id}-url`}
                    type="text"
                    placeholder="https://... paste file URL"
                    value={directUrl ?? ''}
                    onChange={(e) => onUrlChange(e.target.value)}
                    disabled={disabled}
                />
            )}

            {currentUrl && mode === 'file' && !preview && (
                <p className="text-xs text-gray-500 truncate" title={currentUrl}>Current: {currentUrl}</p>
            )}

            {preview}
        </div>
    )
}
