'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userLoginSchema, type UserLoginData } from '@/lib/validations/user'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

function LoginForm() {
    const router = useRouter()
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UserLoginData>({
        resolver: zodResolver(userLoginSchema),
    })

    const onSubmit = async (data: UserLoginData) => {
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/site-auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json()
                setError(errorData.error || 'Invalid username or password')
                setIsLoading(false)
                return
            }

            router.push('/')
            router.refresh()
        } catch {
            setError('Something went wrong. Please try again.')
            setIsLoading(false)
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
                <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    className='text-white/70'
                    {...register('username')}
                    disabled={isLoading}
                />
                {errors.username && (
                    <p className="text-sm text-red-600">{errors.username.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className='text-white/70'
                    {...register('password')}
                    disabled={isLoading}
                />
                {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
            </div>

            <div className="flex justify-center">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full max-w-sm py-3 sm:py-4 px-8 bg-[hsl(var(--ptr-primary))] font-spotify text-primary text-base sm:text-lg font-semibold rounded-full hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
            </div>
        </form>
    )
}

export default function SiteLoginPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-primary">
            <div className="absolute top-0 z-[0] h-screen w-screen bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(16,48,39,0.8),rgba(255,255,255,0))]" />
            <div className="relative z-10 w-[calc(100%-2rem)] sm:w-full max-w-md">
                <div className="bg-black rounded-2xl p-8 sm:p-10">
                    <div className="mb-8 text-center">
                        <div className="flex h-16 items-center justify-center px-4">
                            <Image
                                src="/images/logo.png"
                                alt="Spotify Advertising"
                                width={180}
                                height={50}
                                className="h-10 w-auto"
                                unoptimized
                            />
                        </div>
                        <p className="mt-2 font-spotify text-[hsl(var(--ptr-primary))]">Sign in to access the site</p>
                    </div>

                    <LoginForm />
                </div>
            </div>
        </div>
    )
}
