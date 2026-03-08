'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CategoryTable } from './CategoryTable'
import { CategoryDialog } from './CategoryDialog'

interface Category {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
}

interface PaginationData {
    total: number
    page: number
    limit: number
    totalPages: number
}

export function CategoriesClient() {
    const { data: session } = useSession()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [categories, setCategories] = useState<Category[]>([])
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editCategory, setEditCategory] = useState<Category | null>(null)

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1) // Reset to page 1 when search changes
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm])

    // Fetch categories from API
    const fetchCategories = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(debouncedSearch && { search: debouncedSearch }),
            })

            const response = await fetch(`/api/categories?${params}`)
            if (!response.ok) {
                throw new Error('Failed to fetch categories')
            }

            const data = await response.json()
            setCategories(data.categories)
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error fetching categories:', error)
            toast.error('Failed to load categories')
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, debouncedSearch])

    // Fetch data when page or search changes
    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    // Handle add
    const handleAdd = () => {
        setEditCategory(null)
        setDialogOpen(true)
    }

    // Handle edit
    const handleEdit = (category: Category) => {
        setEditCategory(category)
        setDialogOpen(true)
    }

    // Handle success (after create/update)
    const handleSuccess = () => {
        fetchCategories()
        router.refresh()
    }

    // Handle delete
    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete category')
            }

            // Show success toast
            toast.success('Category deleted successfully')

            // Refresh the data
            await fetchCategories()
        } catch (error) {
            console.error('Error deleting category:', error)
            toast.error('Failed to delete category')
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
                    <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                    <p className="mt-2 text-gray-600">Manage article categories</p>
                </div>
                <Button onClick={handleAdd}>Add Category</Button>
            </div>
            <Card className="gap-4">
                <CardHeader>
                    {/* Search Input */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Category Table */}
                    <CategoryTable
                        categories={categories}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                            Showing {pagination.total === 0 ? 0 : (currentPage - 1) * pagination.limit + 1} to{' '}
                            {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} categories
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

            {/* Category Dialog */}
            <CategoryDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                category={editCategory}
                onSuccess={handleSuccess}
            />
        </div>
    )
}
