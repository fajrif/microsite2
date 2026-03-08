'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AdProductTable } from './AdProductTable'

interface AdProduct {
    id: string
    name: string
    tagline: string
    orderNo: number
    image: string
    _count: { features: number }
    createdAt: Date
}

interface PaginationData {
    total: number
    page: number
    limit: number
    totalPages: number
}

export function AdProductsClient() {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [adProducts, setAdProducts] = useState<AdProduct[]>([])
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const fetchAdProducts = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(debouncedSearch && { search: debouncedSearch }),
            })

            const response = await fetch(`/api/ad-products?${params}`)
            if (!response.ok) throw new Error('Failed to fetch ad products')

            const data = await response.json()
            setAdProducts(data.adProducts)
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error fetching ad products:', error)
            toast.error('Failed to load ad products')
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, debouncedSearch])

    useEffect(() => {
        fetchAdProducts()
    }, [fetchAdProducts])

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/ad-products/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Failed to delete ad product')

            toast.success('Ad product deleted successfully')
            await fetchAdProducts()
        } catch (error) {
            console.error('Error deleting ad product:', error)
            toast.error('Failed to delete ad product')
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
                    <h1 className="text-3xl font-bold text-gray-900">Ad Products</h1>
                    <p className="mt-2 text-gray-600">Manage ad products and their features</p>
                </div>
                <Link href="/admin/ad-products/new">
                    <Button>Add Ad Product</Button>
                </Link>
            </div>
            <Card className="gap-4">
                <CardHeader>
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search ad products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <AdProductTable
                        adProducts={adProducts}
                        isLoading={isLoading}
                        onDelete={handleDelete}
                    />

                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                            Showing {pagination.total === 0 ? 0 : (currentPage - 1) * pagination.limit + 1} to{' '}
                            {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} ad products
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
