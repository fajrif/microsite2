'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import slugify from 'slugify'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'

interface CareerFormData {
    title: string
    slug: string
    department: string
    location: string
    employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
    short_description?: string
    content?: string
    requirements?: string
    benefits?: string
    salary_range?: string
    published_date?: string
    status: 'DRAFT' | 'PUBLISHED'
    meta_title?: string
    meta_description?: string
}

interface CareerFormProps {
    initialData?: any
}

export function CareerForm({ initialData }: CareerFormProps) {
    const router = useRouter()
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEdit = !!initialData

    // Set up default values including today's date for published_date
    const defaultValues: Partial<CareerFormData> = {
        ...initialData,
        status: initialData?.status || 'DRAFT',
        employment_type: initialData?.employment_type || 'FULL_TIME',
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
    } = useForm<CareerFormData>({
        defaultValues,
    })

    // Initialize TipTap editor for content
    const contentEditor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TiptapLink.configure({
                openOnClick: false,
            }),
        ],
        content: initialData?.content || '',
        onUpdate: ({ editor }) => {
            setValue('content', editor.getHTML())
        },
    })

    // Initialize TipTap editor for requirements
    const requirementsEditor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TiptapLink.configure({
                openOnClick: false,
            }),
        ],
        content: initialData?.requirements || '',
        onUpdate: ({ editor }) => {
            setValue('requirements', editor.getHTML())
        },
    })

    // Initialize TipTap editor for benefits
    const benefitsEditor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TiptapLink.configure({
                openOnClick: false,
            }),
        ],
        content: initialData?.benefits || '',
        onUpdate: ({ editor }) => {
            setValue('benefits', editor.getHTML())
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

    // Set initial content in editors
    useEffect(() => {
        if (contentEditor && initialData?.content && contentEditor.isEmpty) {
            contentEditor.commands.setContent(initialData.content)
        }
        if (requirementsEditor && initialData?.requirements && requirementsEditor.isEmpty) {
            requirementsEditor.commands.setContent(initialData.requirements)
        }
        if (benefitsEditor && initialData?.benefits && benefitsEditor.isEmpty) {
            benefitsEditor.commands.setContent(initialData.benefits)
        }
    }, [contentEditor, requirementsEditor, benefitsEditor, initialData])

    const onSubmit = async (data: CareerFormData) => {
        setIsSubmitting(true)
        setError('')

        try {
            const formData = new FormData()

            // Get content from editors
            const content = contentEditor?.getHTML() || ''
            const requirements = requirementsEditor?.getHTML() || ''
            const benefits = benefitsEditor?.getHTML() || ''

            // Append all form data
            Object.entries({ ...data, content, requirements, benefits }).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString())
                }
            })

            const url = isEdit ? `/api/careers/${initialData.id}` : '/api/careers'
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                body: formData,
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to save career')
            }

            // Show success toast
            toast.success(isEdit ? 'Career updated successfully' : 'Career created successfully')

            router.push('/admin/careers')
            router.refresh()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
            setError(errorMessage)
            toast.error(errorMessage)
            setIsSubmitting(false)
        }
    }

    const EditorToolbar = ({ editor }: { editor: any }) => (
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
        </div>
    )

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                    id="title"
                    {...register('title', { required: 'Title is required' })}
                    disabled={isSubmitting}
                    placeholder="e.g. Senior Full Stack Developer"
                />
                {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>

            {/* 3-Column Grid: Department, Location, Employment Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Department */}
                <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input
                        id="department"
                        {...register('department', { required: 'Department is required' })}
                        disabled={isSubmitting}
                        placeholder="e.g. Engineering"
                    />
                    {errors.department && <p className="text-sm text-red-600">{errors.department.message}</p>}
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                        id="location"
                        {...register('location', { required: 'Location is required' })}
                        disabled={isSubmitting}
                        placeholder="e.g. Jakarta, Indonesia"
                    />
                    {errors.location && <p className="text-sm text-red-600">{errors.location.message}</p>}
                </div>

                {/* Employment Type */}
                <div className="space-y-2">
                    <Label htmlFor="employment_type">Employment Type *</Label>
                    <select
                        id="employment_type"
                        {...register('employment_type')}
                        className="w-full border rounded-md px-3 py-2 bg-white"
                        disabled={isSubmitting}
                    >
                        <option value="FULL_TIME">Full-time</option>
                        <option value="PART_TIME">Part-time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERNSHIP">Internship</option>
                    </select>
                </div>
            </div>

            {/* Salary Range */}
            <div className="space-y-2">
                <Label htmlFor="salary_range">Salary Range (optional)</Label>
                <Input
                    id="salary_range"
                    {...register('salary_range')}
                    disabled={isSubmitting}
                    placeholder="e.g. Rp 15.000.000 - Rp 25.000.000"
                />
            </div>

            {/* Short Description */}
            <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                    id="short_description"
                    {...register('short_description')}
                    disabled={isSubmitting}
                    placeholder="Brief summary of the role..."
                />
            </div>

            {/* Rich Text Editor for Content */}
            <div className="space-y-2">
                <Label>Job Description</Label>
                <div className="border rounded-md">
                    <EditorToolbar editor={contentEditor} />
                    <EditorContent
                        editor={contentEditor}
                        className="prose max-w-none p-4 min-h-[200px] focus:outline-none"
                    />
                </div>
            </div>

            {/* Rich Text Editor for Requirements */}
            <div className="space-y-2">
                <Label>Requirements</Label>
                <div className="border rounded-md">
                    <EditorToolbar editor={requirementsEditor} />
                    <EditorContent
                        editor={requirementsEditor}
                        className="prose max-w-none p-4 min-h-[150px] focus:outline-none"
                    />
                </div>
            </div>

            {/* Rich Text Editor for Benefits */}
            <div className="space-y-2">
                <Label>Benefits</Label>
                <div className="border rounded-md">
                    <EditorToolbar editor={benefitsEditor} />
                    <EditorContent
                        editor={benefitsEditor}
                        className="prose max-w-none p-4 min-h-[150px] focus:outline-none"
                    />
                </div>
            </div>

            {/* 2-Column Grid: Published Date, Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {isSubmitting ? 'Saving...' : isEdit ? 'Update Career' : 'Create Career'}
                </Button>
                <Link href="/admin/careers">
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                        Cancel
                    </Button>
                </Link>
            </div>
        </form>
    )
}
