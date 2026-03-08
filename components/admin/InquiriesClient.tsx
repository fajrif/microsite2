'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Trash2, Mail, Building2, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Inquiry {
    id: string
    name: string
    email: string
    company: string | null
    message: string
    ip: string | null
    createdAt: string
}

interface PaginationData {
    total: number
    page: number
    limit: number
    totalPages: number
}

export function InquiriesClient() {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [inquiries, setInquiries] = useState<Inquiry[]>([])
    const [expanded, setExpanded] = useState<string | null>(null)
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    })
    const [isLoading, setIsLoading] = useState(true)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const fetchInquiries = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(debouncedSearch && { search: debouncedSearch }),
            })
            const res = await fetch(`/api/admin/inquiries?${params}`)
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setInquiries(data.inquiries)
            setPagination(data.pagination)
        } catch {
            toast.error('Failed to load inquiries')
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, debouncedSearch])

    useEffect(() => {
        fetchInquiries()
    }, [fetchInquiries])

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')
            toast.success('Inquiry deleted')
            await fetchInquiries()
        } catch {
            toast.error('Failed to delete inquiry')
        }
    }

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
                <p className="mt-2 text-gray-600">Contact form submissions from visitors</p>
            </div>

            <Card className="gap-4">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search by name, email, or company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                            {pagination.total} total
                        </span>
                    </div>
                </CardHeader>

                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : inquiries.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <Mail className="h-10 w-10 mx-auto mb-3 opacity-40" />
                            <p className="font-medium">No inquiries found</p>
                            {debouncedSearch && (
                                <p className="text-sm mt-1">Try a different search term</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {inquiries.map((inquiry) => (
                                <div
                                    key={inquiry.id}
                                    className="border border-gray-200 rounded-lg overflow-hidden"
                                >
                                    {/* Row header */}
                                    <div
                                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => setExpanded(expanded === inquiry.id ? null : inquiry.id)}
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-blue-600 font-semibold text-sm">
                                                    {inquiry.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 text-sm truncate">{inquiry.name}</p>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {inquiry.email}
                                                    </span>
                                                    {inquiry.company && (
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="h-3 w-3" />
                                                            {inquiry.company}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                            <span className="text-xs text-gray-400 flex items-center gap-1 hidden sm:flex">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(inquiry.createdAt)}
                                            </span>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Delete inquiry from <strong>{inquiry.name}</strong>? This cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(inquiry.id)}
                                                            className="bg-red-600 hover:bg-red-700 text-white"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>

                                    {/* Expanded message */}
                                    {expanded === inquiry.id && (
                                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <a
                                                    href={`mailto:${inquiry.email}`}
                                                    className="text-xs text-blue-600 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Reply to {inquiry.email}
                                                </a>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {inquiry.message}
                                            </p>
                                            {inquiry.ip && (
                                                <p className="text-xs text-gray-400 mt-3">IP: {inquiry.ip}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-500">
                            {pagination.total === 0
                                ? 'No results'
                                : `Showing ${(currentPage - 1) * pagination.limit + 1}–${Math.min(
                                    currentPage * pagination.limit,
                                    pagination.total
                                )} of ${pagination.total}`}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => p - 1)}
                                disabled={currentPage === 1 || isLoading}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => p + 1)}
                                disabled={currentPage >= pagination.totalPages || isLoading}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
