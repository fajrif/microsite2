'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema, userUpdateSchema, type UserFormData, type UserUpdateData } from '@/lib/validations/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { toast } from 'sonner'

export function UserForm({ initialData }: { initialData?: any }) {
    const router = useRouter()
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEdit = !!initialData

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UserFormData | UserUpdateData>({
        resolver: zodResolver(isEdit ? userUpdateSchema : userSchema),
        defaultValues: initialData || {},
    })

    const onSubmit = async (data: UserFormData | UserUpdateData) => {
        setIsSubmitting(true)
        setError('')

        try {
            const url = isEdit ? `/api/users/${initialData.id}` : '/api/users'
            const method = isEdit ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to save user')
            }

            toast.success(isEdit ? 'User updated successfully' : 'User created successfully')
            router.push('/admin/users')
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

            <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input id="username" {...register('username')} disabled={isSubmitting} />
                {errors.username && (
                    <p className="text-sm text-red-600">{errors.username.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input id="full_name" {...register('full_name')} disabled={isSubmitting} />
                {errors.full_name && (
                    <p className="text-sm text-red-600">{errors.full_name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" {...register('phone')} disabled={isSubmitting} />
                {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...register('company')} disabled={isSubmitting} />
                {errors.company && (
                    <p className="text-sm text-red-600">{errors.company.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">
                    Password {isEdit && '(leave blank to keep current)'}
                </Label>
                <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    disabled={isSubmitting}
                />
                {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
                <p className="text-sm text-gray-500">
                    Must be 8+ characters with uppercase, lowercase, number, and special character
                </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
                </Button>
                <Link href="/admin/users">
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                        Cancel
                    </Button>
                </Link>
            </div>
        </form>
    )
}
