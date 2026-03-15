'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { featureSchema, type FeatureFormData } from '@/lib/validations/ad-product'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileOrUrlInput } from '@/components/ui/file-or-url-input'
import { UploadProgressList } from '@/components/ui/upload-progress'
import { useFileUpload } from '@/lib/hooks/use-file-upload'
import { toast } from 'sonner'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import TiptapImage from '@tiptap/extension-image'
import { Trash2 } from 'lucide-react'

interface FeatureFormProps {
    initialData?: any
    adProducts: Array<{ id: string; name: string }>
}

export function FeatureForm({ initialData, adProducts }: FeatureFormProps) {
    const router = useRouter()
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imageDirectUrl, setImageDirectUrl] = useState('')
    const [adProductId, setAdProductId] = useState(initialData?.ad_product_id || '')
    const isEdit = !!initialData

    // Audio state
    const [audioFile, setAudioFile] = useState<File | null>(null)
    const [audioDirectUrl, setAudioDirectUrl] = useState('')
    const [audioPreview, setAudioPreview] = useState<string | null>(initialData?.audio_link || null)
    const [audioDeleted, setAudioDeleted] = useState(false)

    // Video state
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [videoDirectUrl, setVideoDirectUrl] = useState('')
    const [videoPreview, setVideoPreview] = useState<string | null>(initialData?.video_link || null)
    const [videoDeleted, setVideoDeleted] = useState(false)

    const upload = useFileUpload()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<FeatureFormData>({
        resolver: zodResolver(featureSchema),
        defaultValues: {
            name: initialData?.name || '',
            caption: initialData?.caption || '',
            description: initialData?.description || '',
            orderNo: initialData?.orderNo ?? 0,
        },
    })

    // Initialize TipTap editor for caption (rich text)
    const captionEditor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TiptapLink.configure({ openOnClick: false }),
            TiptapImage,
        ],
        content: initialData?.caption || '',
        onUpdate: ({ editor }) => {
            setValue('caption', editor.getHTML())
        },
    })

    // Initialize TipTap editor for description (rich text)
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TiptapLink.configure({
                openOnClick: false,
            }),
            TiptapImage,
        ],
        content: initialData?.description || '',
        onUpdate: ({ editor }) => {
            setValue('description', editor.getHTML())
        },
    })

    const handleImageFileChange = (file: File | null) => {
        setImageFile(file)
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        } else {
            setImagePreview(initialData?.image || null)
        }
    }

    const handleDeleteAudio = () => {
        setAudioDeleted(true)
        setAudioFile(null)
        setAudioDirectUrl('')
        setAudioPreview(null)
    }

    const handleDeleteVideo = () => {
        setVideoDeleted(true)
        setVideoFile(null)
        setVideoDirectUrl('')
        setVideoPreview(null)
    }

    const onSubmit = async (data: FeatureFormData) => {
        setIsSubmitting(true)
        setError('')

        try {
            if (!adProductId) {
                setError('Ad Product is required')
                setIsSubmitting(false)
                return
            }

            if (!isEdit && !imageFile && !imageDirectUrl) {
                setError('Image is required')
                setIsSubmitting(false)
                return
            }

            // Pre-upload all selected files
            const filesToUpload: File[] = []
            const fileKeys: string[] = []

            if (imageFile) { filesToUpload.push(imageFile); fileKeys.push('image') }
            if (audioFile) { filesToUpload.push(audioFile); fileKeys.push('audio') }
            if (videoFile) { filesToUpload.push(videoFile); fileKeys.push('video') }

            let resolvedImageUrl = imageDirectUrl
            let resolvedAudioUrl = audioDirectUrl
            let resolvedVideoUrl = videoDirectUrl

            if (filesToUpload.length > 0) {
                const results = await upload.uploadFiles(filesToUpload)
                const urls = Array.from(results.values())
                let urlIndex = 0
                if (imageFile) { resolvedImageUrl = urls[urlIndex++] || '' }
                if (audioFile) { resolvedAudioUrl = urls[urlIndex++] || '' }
                if (videoFile) { resolvedVideoUrl = urls[urlIndex++] || '' }
            }

            const formData = new FormData()

            formData.append('name', data.name)
            if (data.caption) formData.append('caption', data.caption)
            if (data.description) formData.append('description', data.description)
            formData.append('orderNo', (data.orderNo ?? 0).toString())
            formData.append('ad_product_id', adProductId)

            if (resolvedImageUrl) {
                formData.append('image_url', resolvedImageUrl)
            }

            if (resolvedAudioUrl) {
                formData.append('audio_url', resolvedAudioUrl)
            }
            if (audioDeleted) {
                formData.append('remove_audio', 'true')
            }

            if (resolvedVideoUrl) {
                formData.append('video_url', resolvedVideoUrl)
            }
            if (videoDeleted) {
                formData.append('remove_video', 'true')
            }

            const url = isEdit ? `/api/features/${initialData.id}` : '/api/features'
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to save feature')
            }

            toast.success(isEdit ? 'Feature updated successfully' : 'Feature created successfully')

            router.push('/admin/features')
            router.refresh()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
            setError(errorMessage)
            toast.error(errorMessage)
            setIsSubmitting(false)
        }
    }

    const disabled = isSubmitting || upload.isUploading

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <UploadProgressList
                items={upload.items}
                overallProgress={upload.overallProgress}
                onCancel={upload.abort}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" {...register('name')} disabled={disabled} />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="ad_product_id">Ad Product *</Label>
                    <select
                        id="ad_product_id"
                        value={adProductId}
                        onChange={(e) => setAdProductId(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 bg-white"
                        disabled={disabled}
                    >
                        <option value="">Select an ad product</option>
                        {adProducts.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Caption (Rich Text)</Label>
                <div className="border rounded-md overflow-hidden">
                    {captionEditor && (
                        <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
                            <Button
                                type="button"
                                variant={captionEditor.isActive('bold') ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => captionEditor.chain().focus().toggleBold().run()}
                            >
                                B
                            </Button>
                            <Button
                                type="button"
                                variant={captionEditor.isActive('italic') ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => captionEditor.chain().focus().toggleItalic().run()}
                            >
                                I
                            </Button>
                            <Button
                                type="button"
                                variant={captionEditor.isActive('bulletList') ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => captionEditor.chain().focus().toggleBulletList().run()}
                            >
                                List
                            </Button>
                            <Button
                                type="button"
                                variant={captionEditor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => captionEditor.chain().focus().toggleHeading({ level: 2 }).run()}
                            >
                                H2
                            </Button>
                            <Button
                                type="button"
                                variant={captionEditor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => captionEditor.chain().focus().toggleHeading({ level: 3 }).run()}
                            >
                                H3
                            </Button>
                        </div>
                    )}
                    <EditorContent
                        editor={captionEditor}
                        className="prose max-w-none p-4 min-h-[100px] [&_.tiptap]:outline-none"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="orderNo">Order No</Label>
                <Input id="orderNo" type="number" {...register('orderNo', { valueAsNumber: true })} disabled={disabled} placeholder="0" />
            </div>

            <div className="space-y-2">
                <Label>Description (Rich Text)</Label>
                <div className="border rounded-md overflow-hidden">
                    {editor && (
                        <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
                            <Button
                                type="button"
                                variant={editor.isActive('bold') ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => editor.chain().focus().toggleBold().run()}
                            >
                                B
                            </Button>
                            <Button
                                type="button"
                                variant={editor.isActive('italic') ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                            >
                                I
                            </Button>
                            <Button
                                type="button"
                                variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                            >
                                List
                            </Button>
                            <Button
                                type="button"
                                variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            >
                                H2
                            </Button>
                            <Button
                                type="button"
                                variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            >
                                H3
                            </Button>
                        </div>
                    )}
                    <EditorContent
                        editor={editor}
                        className="prose max-w-none p-4 min-h-[200px] [&_.tiptap]:outline-none"
                    />
                </div>
            </div>

            {/* Image Upload */}
            <FileOrUrlInput
                id="image"
                label={isEdit ? 'Replace Image' : 'Image *'}
                accept="image/*"
                disabled={disabled}
                currentUrl={initialData?.image}
                onFileChange={handleImageFileChange}
                onUrlChange={setImageDirectUrl}
                directUrl={imageDirectUrl}
                preview={imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="mt-2 max-h-40 rounded" />
                ) : undefined}
            />

            {/* Audio Upload */}
            <div className="space-y-2">
                {audioPreview && !audioFile && !audioDeleted && !audioDirectUrl ? (
                    <div className="space-y-2">
                        <Label>Audio File</Label>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500 truncate flex-1">
                                Current: {audioPreview}
                            </p>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleDeleteAudio}
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                            </Button>
                        </div>
                        <FileOrUrlInput
                            id="audio"
                            label="Replace Audio"
                            accept="audio/*"
                            disabled={disabled}
                            onFileChange={(f) => { setAudioFile(f); if (f) setAudioDeleted(false) }}
                            onUrlChange={(u) => { setAudioDirectUrl(u); if (u) setAudioDeleted(false) }}
                            directUrl={audioDirectUrl}
                        />
                    </div>
                ) : (
                    <FileOrUrlInput
                        id="audio"
                        label="Audio File"
                        accept="audio/*"
                        disabled={disabled}
                        onFileChange={(f) => { setAudioFile(f); if (f) setAudioDeleted(false) }}
                        onUrlChange={(u) => { setAudioDirectUrl(u); if (u) setAudioDeleted(false) }}
                        directUrl={audioDirectUrl}
                    />
                )}
                {audioDeleted && (
                    <p className="text-xs text-red-500">Audio will be deleted on save</p>
                )}
            </div>

            {/* Video Upload */}
            <div className="space-y-2">
                {videoPreview && !videoFile && !videoDeleted && !videoDirectUrl ? (
                    <div className="space-y-2">
                        <Label>Video File</Label>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500 truncate flex-1">
                                Current: {videoPreview}
                            </p>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleDeleteVideo}
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                            </Button>
                        </div>
                        <FileOrUrlInput
                            id="video"
                            label="Replace Video"
                            accept="video/*"
                            disabled={disabled}
                            onFileChange={(f) => { setVideoFile(f); if (f) setVideoDeleted(false) }}
                            onUrlChange={(u) => { setVideoDirectUrl(u); if (u) setVideoDeleted(false) }}
                            directUrl={videoDirectUrl}
                        />
                    </div>
                ) : (
                    <FileOrUrlInput
                        id="video"
                        label="Video File"
                        accept="video/*"
                        disabled={disabled}
                        onFileChange={(f) => { setVideoFile(f); if (f) setVideoDeleted(false) }}
                        onUrlChange={(u) => { setVideoDirectUrl(u); if (u) setVideoDeleted(false) }}
                        directUrl={videoDirectUrl}
                    />
                )}
                {videoDeleted && (
                    <p className="text-xs text-red-500">Video will be deleted on save</p>
                )}
            </div>

            <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={disabled}>
                    {upload.isUploading ? 'Uploading...' : isSubmitting ? 'Saving...' : isEdit ? 'Update Feature' : 'Create Feature'}
                </Button>
                <Link href="/admin/features">
                    <Button type="button" variant="outline" disabled={disabled}>
                        Cancel
                    </Button>
                </Link>
            </div>
        </form>
    )
}
