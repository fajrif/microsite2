'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { UserTable } from './UserTable'
import Link from 'next/link'

interface User {
    id: string
    username: string
    full_name: string
    phone: string | null
    company: string | null
    createdAt: Date
    updatedAt: Date
}

interface PaginationData {
    total: number
    page: number
    limit: number
    totalPages: number
}

export function UsersClient() {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [users, setUsers] = useState<User[]>([])
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

    const fetchUsers = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(debouncedSearch && { search: debouncedSearch }),
            })

            const response = await fetch(`/api/users?${params}`)
            if (!response.ok) throw new Error('Failed to fetch users')

            const data = await response.json()
            setUsers(data.users)
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, debouncedSearch])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/users/${id}`, { method: 'DELETE' })
            if (!response.ok) throw new Error('Failed to delete user')

            toast.success('User deleted successfully')
            await fetchUsers()
        } catch (error) {
            console.error('Error deleting user:', error)
            toast.error('Failed to delete user')
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
                    <h1 className="text-3xl font-bold text-gray-900">Site Users</h1>
                    <p className="mt-2 text-gray-600">Manage site user accounts</p>
                </div>
                <Link href="/admin/users/new">
                    <Button>Add User</Button>
                </Link>
            </div>
            <Card className="gap-4">
                <CardHeader>
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search by name, username, or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <UserTable
                        users={users}
                        isLoading={isLoading}
                        onDelete={handleDelete}
                    />

                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                            Showing {pagination.total === 0 ? 0 : (currentPage - 1) * pagination.limit + 1} to{' '}
                            {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} users
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
