'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CareerTable } from './CareerTable'
import Link from 'next/link'

interface Career {
    id: string
    title: string
    slug: string
    department: string
    location: string
    employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
    short_description: string | null
    content: string | null
    requirements: string | null
    benefits: string | null
    salary_range: string | null
    published_date: Date | null
    status: 'DRAFT' | 'PUBLISHED'
    meta_title: string | null
    meta_description: string | null
    createdAt: Date
    updatedAt: Date
}

interface PaginationData {
    total: number
    page: number
    limit: number
    totalPages: number
}

export function CareersClient() {
    const { data: session } = useSession()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [careers, setCareers] = useState<Career[]>([])
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    })
    const [isLoading, setIsLoading] = useState(true)

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1) // Reset to page 1 when search changes
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm])

    // Fetch careers from API
    const fetchCareers = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(debouncedSearch && { search: debouncedSearch }),
            })

            const response = await fetch(`/api/careers?${params}`)
            if (!response.ok) {
                throw new Error('Failed to fetch careers')
            }

            const data = await response.json()
            setCareers(data.careers)
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error fetching careers:', error)
            toast.error('Failed to load careers')
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, debouncedSearch])

    // Fetch data when page or search changes
    useEffect(() => {
        fetchCareers()
    }, [fetchCareers])

    // Handle delete
    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/careers/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete career')
            }

            // Show success toast
            toast.success('Career deleted successfully')

            // Refresh the data
            await fetchCareers()
        } catch (error) {
            console.error('Error deleting career:', error)
            toast.error('Failed to delete career')
            throw error // Re-throw to let the component handle it
        }
    }

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Careers</h1>
                    <p className="mt-2 text-gray-600">Manage job listings</p>
                </div>
                <Link href="/admin/careers/new">
                    <Button>Add Career</Button>
                </Link>
            </div>
            <Card className="gap-4">
                <CardHeader>
                    {/* Search Input */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search by title, department, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Career Table */}
                    <CareerTable
                        careers={careers}
                        isLoading={isLoading}
                        onDelete={handleDelete}
                    />

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                            Showing {pagination.total === 0 ? 0 : (currentPage - 1) * pagination.limit + 1} to{' '}
                            {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} careers
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || isLoading}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
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
