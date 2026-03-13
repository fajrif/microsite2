'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { adProductSchema, type AdProductFormData } from '@/lib/validations/ad-product'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileOrUrlInput } from '@/components/ui/file-or-url-input'
import { UploadProgressList } from '@/components/ui/upload-progress'
import { useFileUpload } from '@/lib/hooks/use-file-upload'
import { toast } from 'sonner'

interface AdProductFormProps {
    initialData?: any
}

export function AdProductForm({ initialData }: AdProductFormProps) {
    const router = useRouter()
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imageDirectUrl, setImageDirectUrl] = useState('')
    const isEdit = !!initialData

    const upload = useFileUpload()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AdProductFormData>({
        resolver: zodResolver(adProductSchema),
        defaultValues: {
            name: initialData?.name || '',
            tagline: initialData?.tagline || '',
            description: initialData?.description || '',
            orderNo: initialData?.orderNo ?? 0,
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

    const onSubmit = async (data: AdProductFormData) => {
        setIsSubmitting(true)
        setError('')

        try {
            if (!isEdit && !imageFile && !imageDirectUrl) {
                setError('Image is required')
                setIsSubmitting(false)
                return
            }

            // Pre-upload files first, then send URLs to API
            let resolvedImageUrl = imageDirectUrl

            if (imageFile) {
                const filesToUpload = [imageFile]
                const results = await upload.uploadFiles(filesToUpload)
                const url = results.get(`upload-${Array.from(results.keys())[0].split('-').slice(1).join('-')}`)
                // Get by iterating - uploadFiles returns map keyed by item id
                const firstUrl = Array.from(results.values())[0]
                if (!firstUrl) {
                    setError('Image upload failed')
                    setIsSubmitting(false)
                    return
                }
                resolvedImageUrl = firstUrl
            }

            const formData = new FormData()

            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString())
                }
            })

            if (resolvedImageUrl) {
                formData.append('image_url', resolvedImageUrl)
            }

            const url = isEdit ? `/api/ad-products/${initialData.id}` : '/api/ad-products'
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to save ad product')
            }

            toast.success(isEdit ? 'Ad product updated successfully' : 'Ad product created successfully')

            router.push('/admin/ad-products')
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
                    <Label htmlFor="orderNo">Order No</Label>
                    <Input id="orderNo" type="number" {...register('orderNo', { valueAsNumber: true })} disabled={disabled} placeholder="0" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="tagline">Tagline *</Label>
                <Input id="tagline" {...register('tagline')} disabled={disabled} />
                {errors.tagline && <p className="text-sm text-red-600">{errors.tagline.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} disabled={disabled} rows={4} />
            </div>

            <FileOrUrlInput
                id="image"
                label={isEdit ? 'Replace Image' : 'Image *'}
                accept="image/*"
                disabled={disabled}
                currentUrl={initialData?.image}
                onFileChange={handleImageFileChange}
                onUrlChange={setImageDirectUrl}
                directUrl={imageDirectUrl}
                preview={imagePreview && imageFile ? (
                    <img src={imagePreview} alt="Preview" className="mt-2 max-h-40 rounded" />
                ) : imagePreview && !imageFile ? (
                    <img src={imagePreview} alt="Current" className="mt-2 max-h-40 rounded" />
                ) : undefined}
            />

            <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={disabled}>
                    {upload.isUploading ? 'Uploading...' : isSubmitting ? 'Saving...' : isEdit ? 'Update Ad Product' : 'Create Ad Product'}
                </Button>
                <Link href="/admin/ad-products">
                    <Button type="button" variant="outline" disabled={disabled}>
                        Cancel
                    </Button>
                </Link>
            </div>
        </form>
    )
}
