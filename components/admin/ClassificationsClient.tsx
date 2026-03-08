'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ClassificationTable } from './ClassificationTable'
import { ClassificationDialog } from './ClassificationDialog'

interface Classification {
    id: string
    name: string
    description: string | null
    image: string | null
    orderNo: number
    createdAt: Date
    updatedAt: Date
    _count?: { showcases: number }
}

interface PaginationData {
    total: number
    page: number
    limit: number
    totalPages: number
}

export function ClassificationsClient() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [classifications, setClassifications] = useState<Classification[]>([])
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editClassification, setEditClassification] = useState<Classification | null>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const fetchClassifications = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(debouncedSearch && { search: debouncedSearch }),
            })

            const response = await fetch(`/api/classifications?${params}`)
            if (!response.ok) throw new Error('Failed to fetch classifications')

            const data = await response.json()
            setClassifications(data.classifications)
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error fetching classifications:', error)
            toast.error('Failed to load classifications')
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, debouncedSearch])

    useEffect(() => {
        fetchClassifications()
    }, [fetchClassifications])

    const handleAdd = () => {
        setEditClassification(null)
        setDialogOpen(true)
    }

    const handleEdit = (classification: Classification) => {
        setEditClassification(classification)
        setDialogOpen(true)
    }

    const handleSuccess = () => {
        fetchClassifications()
        router.refresh()
    }

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/classifications/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Failed to delete classification')

            toast.success('Classification deleted successfully')
            await fetchClassifications()
        } catch (error) {
            console.error('Error deleting classification:', error)
            toast.error('Failed to delete classification')
            throw error
        }
    }

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Classifications</h1>
                    <p className="mt-2 text-gray-600">Manage showcase classifications</p>
                </div>
                <Button onClick={handleAdd}>Add Classification</Button>
            </div>
            <Card className="gap-4">
                <CardHeader>
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search classifications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <ClassificationTable
                        classifications={classifications}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                            Showing {pagination.total === 0 ? 0 : (currentPage - 1) * pagination.limit + 1} to{' '}
                            {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} classifications
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

            <ClassificationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                classification={editClassification}
                onSuccess={handleSuccess}
            />
        </div>
    )
}
