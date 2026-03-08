'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { articleSchema, type ArticleFormData } from '@/lib/validations/article'
import slugify from 'slugify'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import TiptapImage from '@tiptap/extension-image'
import { X } from 'lucide-react'

interface ArticleFormProps {
    initialData?: any
    categories: Array<{ id: string; name: string }>
}

export function ArticleForm({ initialData, categories }: ArticleFormProps) {
    const router = useRouter()
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null)
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>(initialData?.gallery_images || [])
    const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([])
    const isEdit = !!initialData

    // Set up default values including today's date for published_date
    const defaultValues = {
        ...initialData,
        status: initialData?.status || 'DRAFT',
        published_date: initialData?.published_date
            ? new Date(initialData.published_date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<ArticleFormData>({
        resolver: zodResolver(articleSchema),
        defaultValues,
    })

    // Initialize TipTap editor
    const editor = useEditor({
        immediatelyRender: false, // Fix SSR hydration mismatch
        extensions: [
            StarterKit,
            TiptapLink.configure({
                openOnClick: false,
            }),
            TiptapImage,
        ],
        content: initialData?.content || '',
        onUpdate: ({ editor }) => {
            setValue('content', editor.getHTML())
        },
    })

    const title = watch('title')

    // Auto-generate slug from title using slugify
    useEffect(() => {
        if (title && !isEdit) {
            const slug = slugify(title, { lower: true, strict: true })
            setValue('slug', slug)
        }
    }, [title, isEdit, setValue])

    // Set initial content in editor
    useEffect(() => {
        if (editor && initialData?.content && editor.isEmpty) {
            editor.commands.setContent(initialData.content)
        }
    }, [editor, initialData])

    const onSubmit = async (data: ArticleFormData) => {
        setIsSubmitting(true)
        setError('')

        try {
            const formData = new FormData()

            // Get content from editor
            const content = editor?.getHTML() || ''

            // Append all form data
            Object.entries({ ...data, content }).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString())
                }
            })

            const imageInput = document.getElementById('image') as HTMLInputElement
            if (imageInput?.files?.[0]) {
                formData.append('image', imageInput.files[0])
            }

            // Handle gallery images
            if (isEdit) {
                // For edit: send existing gallery URLs that weren't removed
                const existingGallery = galleryPreviews.filter(url => !url.startsWith('data:'))
                formData.append('existing_gallery_images', JSON.stringify(existingGallery))
            }

            // Append new gallery files
            newGalleryFiles.forEach(file => {
                formData.append('gallery_images', file)
            })

            const url = isEdit ? `/api/articles/${initialData.id}` : '/api/articles'
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                body: formData,
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to save article')
            }

            // Show success toast
            toast.success(isEdit ? 'Article updated successfully' : 'Article created successfully')

            router.push('/admin/articles')
            router.refresh()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
            setError(errorMessage)
            toast.error(errorMessage)
            setIsSubmitting(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            // Store new files for submission
            setNewGalleryFiles(prev => [...prev, ...files])

            // Create previews for new files
            files.forEach(file => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setGalleryPreviews(prev => [...prev, reader.result as string])
                }
                reader.readAsDataURL(file)
            })
        }
        // Clear the input so same file can be selected again
        e.target.value = ''
    }

    const removeGalleryImage = (index: number) => {
        const imageToRemove = galleryPreviews[index]
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index))

        // If it's a new file (data URL), also remove from newGalleryFiles
        if (imageToRemove.startsWith('data:')) {
            // Count how many data URLs come before this index
            const dataUrlIndex = galleryPreviews.slice(0, index + 1).filter(url => url.startsWith('data:')).length - 1
            setNewGalleryFiles(prev => prev.filter((_, i) => i !== dataUrlIndex))
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Featured Image */}
            <div className="space-y-2">
                <Label htmlFor="image">Featured Image</Label>
                <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                />
                {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 max-h-48 rounded" />
                )}
            </div>

            {/* Gallery Images */}
            <div className="space-y-2">
                <Label htmlFor="gallery_images">Gallery Images (Optional)</Label>
                <Input
                    id="gallery_images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">Upload multiple images for the article gallery</p>
                {galleryPreviews.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {galleryPreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={preview}
                                    alt={`Gallery ${index + 1}`}
                                    className="h-24 w-24 object-cover rounded border"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeGalleryImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    disabled={isSubmitting}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register('title')} disabled={isSubmitting} />
                {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>

            {/* Short Description */}
            <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea id="short_description" {...register('short_description')} disabled={isSubmitting} />
            </div>

            {/* Rich Text Editor for Content */}
            <div className="space-y-2">
                <Label>Content</Label>
                <div className="border rounded-md">
                    {/* Editor Toolbar */}
                    <div className="border-b bg-gray-50 p-2 flex gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => editor?.chain().focus().toggleBold().run()}
                            disabled={!editor}
                            className={`px-3 py-1 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : 'bg-white'} border hover:bg-gray-100 disabled:opacity-50`}
                        >
                            <strong>B</strong>
                        </button>
                        <button
                            type="button"
                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                            disabled={!editor}
                            className={`px-3 py-1 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : 'bg-white'} border hover:bg-gray-100 disabled:opacity-50`}
                        >
                            <em>I</em>
                        </button>
                        <button
                            type="button"
                            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                            disabled={!editor}
                            className={`px-3 py-1 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'bg-white'} border hover:bg-gray-100 disabled:opacity-50`}
                        >
                            H2
                        </button>
                        <button
                            type="button"
                            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                            disabled={!editor}
                            className={`px-3 py-1 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200' : 'bg-white'} border hover:bg-gray-100 disabled:opacity-50`}
                        >
                            H3
                        </button>
                        <button
                            type="button"
                            onClick={() => editor?.chain().focus().toggleBulletList().run()}
                            disabled={!editor}
                            className={`px-3 py-1 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : 'bg-white'} border hover:bg-gray-100 disabled:opacity-50`}
                        >
                            • List
                        </button>
                        <button
                            type="button"
                            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                            disabled={!editor}
                            className={`px-3 py-1 rounded ${editor?.isActive('orderedList') ? 'bg-gray-200' : 'bg-white'} border hover:bg-gray-100 disabled:opacity-50`}
                        >
                            1. List
                        </button>
                        <button
                            type="button"
                            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                            disabled={!editor}
                            className={`px-3 py-1 rounded ${editor?.isActive('blockquote') ? 'bg-gray-200' : 'bg-white'} border hover:bg-gray-100 disabled:opacity-50`}
                        >
                            " Quote
                        </button>
                    </div>
                    {/* Editor Content */}
                    <EditorContent
                        editor={editor}
                        className="prose max-w-none [&_.ProseMirror]:p-4 [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:cursor-text"
                    />
                </div>
            </div>

            {/* 3-Column Grid: Category, Published Date, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category */}
                <div className="space-y-2">
                    <Label htmlFor="category_id">Category *</Label>
                    <select
                        id="category_id"
                        {...register('category_id')}
                        className="w-full border rounded-md px-3 py-2 bg-white"
                        disabled={isSubmitting}
                    >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {errors.category_id && <p className="text-sm text-red-600">{errors.category_id.message}</p>}
                </div>

                {/* Published Date */}
                <div className="space-y-2">
                    <Label htmlFor="published_date">Published Date</Label>
                    <Input
                        id="published_date"
                        type="date"
                        {...register('published_date')}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <select
                        id="status"
                        {...register('status')}
                        className="w-full border rounded-md px-3 py-2 bg-white"
                        disabled={isSubmitting}
                    >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                    </select>
                </div>
            </div>

            {/* SEO Fields */}
            <div className="space-y-2">
                <Label htmlFor="meta_title">SEO Title</Label>
                <Input id="meta_title" {...register('meta_title')} disabled={isSubmitting} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="meta_description">SEO Description</Label>
                <Textarea id="meta_description" {...register('meta_description')} disabled={isSubmitting} />
            </div>

            {/* Hidden slug field for form validation */}
            <input type="hidden" {...register('slug')} />

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : isEdit ? 'Update Article' : 'Create Article'}
                </Button>
                <Link href="/admin/articles">
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                        Cancel
                    </Button>
                </Link>
            </div>
        </form>
    )
}
