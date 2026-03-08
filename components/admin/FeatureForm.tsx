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
import { toast } from 'sonner'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import TiptapImage from '@tiptap/extension-image'

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
    const [adProductId, setAdProductId] = useState(initialData?.ad_product_id || '')
    const isEdit = !!initialData

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
            video_link: initialData?.video_link || '',
            audio_link: initialData?.audio_link || '',
            orderNo: initialData?.orderNo ?? 0,
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
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

            if (!isEdit && !imageFile) {
                setError('Image is required')
                setIsSubmitting(false)
                return
            }

            const formData = new FormData()

            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString())
                }
            })

            formData.append('ad_product_id', adProductId)

            if (imageFile) {
                formData.append('image', imageFile)
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" {...register('name')} disabled={isSubmitting} />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="ad_product_id">Ad Product *</Label>
                    <select
                        id="ad_product_id"
                        value={adProductId}
                        onChange={(e) => setAdProductId(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 bg-white"
                        disabled={isSubmitting}
                    >
                        <option value="">Select an ad product</option>
                        {adProducts.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="caption">Caption</Label>
                    <Input id="caption" {...register('caption')} disabled={isSubmitting} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="orderNo">Order No</Label>
                    <Input id="orderNo" type="number" {...register('orderNo', { valueAsNumber: true })} disabled={isSubmitting} placeholder="0" />
                </div>
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

            <div className="space-y-2">
                <Label htmlFor="image">{isEdit ? 'Replace Image' : 'Image *'}</Label>
                <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                />
                {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 max-h-40 rounded" />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="video_link">Video Link</Label>
                    <Input
                        id="video_link"
                        {...register('video_link')}
                        disabled={isSubmitting}
                        placeholder="/public/uploads/videos/sample.mp4"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="audio_link">Audio Link</Label>
                    <Input
                        id="audio_link"
                        {...register('audio_link')}
                        disabled={isSubmitting}
                        placeholder="/public/uploads/audios/sample.wav"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : isEdit ? 'Update Feature' : 'Create Feature'}
                </Button>
                <Link href="/admin/features">
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                        Cancel
                    </Button>
                </Link>
            </div>
        </form>
    )
}
