'use client'

import type React from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from '@/components/admin/Sidebar'
import Topbar from '@/components/admin/Topbar'
import { Toaster } from '@/components/ui/sonner'
import '@/styles/admin.css'

function AdminLayoutContent({
    children,
}: {
    children: React.ReactNode
}) {
    const { status } = useSession()
    const pathname = usePathname()
    const router = useRouter()

    // Check if we're on the login page
    const isLoginPage = pathname === '/admin/login'

    // Handle authentication redirects in useEffect to avoid setState during render
    useEffect(() => {
        if (status === 'unauthenticated' && !isLoginPage) {
            router.push('/admin/login')
        }
    }, [status, router, isLoginPage])

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    // Allow login page to render even when unauthenticated
    if (status === 'unauthenticated' && !isLoginPage) {
        return null
    }

    // If on login page, just render the children without the admin layout
    if (isLoginPage) {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            {/* Main content */}
            <div className="lg:pl-64">
                <Topbar />
                {/* Page content */}
                <main className="flex-1">{children}</main>
            </div>
            <Toaster
                position="top-right"
                toastOptions={{
                    classNames: {
                        success: 'bg-green-600 text-white border-green-600',
                        error: 'bg-red-600 text-white border-red-600',
                    },
                }}
            />
        </div>
    )
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SessionProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </SessionProvider>
    )
}
