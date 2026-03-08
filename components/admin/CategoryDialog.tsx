'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema, type CategoryFormData } from '@/lib/validations/category'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface CategoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category?: { id: string; name: string } | null
    onSuccess: () => void
}

export function CategoryDialog({
    open,
    onOpenChange,
    category,
    onSuccess,
}: CategoryDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const isEdit = !!category

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
    })

    useEffect(() => {
        if (category) {
            reset({ name: category.name })
        } else {
            reset({ name: '' })
        }
    }, [category, reset])

    // Reset form and state when dialog closes
    useEffect(() => {
        if (!open) {
            reset({ name: '' })
            setIsSubmitting(false)
            setError('')
        }
    }, [open, reset])

    const onSubmit = async (data: CategoryFormData) => {
        setIsSubmitting(true)
        setError('')

        try {
            const url = isEdit ? `/api/categories/${category.id}` : '/api/categories'
            const method = isEdit ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to save category')
            }

            // Show success toast
            toast.success(isEdit ? 'Category updated successfully' : 'Category created successfully')

            reset()
            onSuccess()
            onOpenChange(false)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
            setError(errorMessage)
            toast.error(errorMessage)
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Update the category name'
                            : 'Create a new category for organizing articles'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Category Name *</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            disabled={isSubmitting}
                            placeholder="e.g., Technology, Business, News"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
