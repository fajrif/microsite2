'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
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
import { ArrowLeft, Pencil, Trash2, Star } from 'lucide-react'
import { SurveyEditDialog } from './SurveyEditDialog'

interface Survey {
    id: string
    rating: number
    ip: string
    createdAt: string
    ad_product: { id: string; name: string }
}

interface PaginationData {
    total: number
    page: number
    limit: number
    totalPages: number
}

interface SurveyDetailClientProps {
    adProductId: string
}

export function SurveyDetailClient({ adProductId }: SurveyDetailClientProps) {
    const router = useRouter()
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0, page: 1, limit: 10, totalPages: 0,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [editSurvey, setEditSurvey] = useState<Survey | null>(null)

    const adProductName = surveys[0]?.ad_product?.name || 'Ad Product'

    const fetchSurveys = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                ad_product_id: adProductId,
                page: currentPage.toString(),
                limit: '10',
            })
            const res = await fetch(`/api/surveys?${params}`)
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setSurveys(data.surveys)
            setPagination(data.pagination)
        } catch {
            toast.error('Failed to load surveys')
        } finally {
            setIsLoading(false)
        }
    }, [adProductId, currentPage])

    useEffect(() => {
        fetchSurveys()
    }, [fetchSurveys])

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/surveys/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')
            toast.success('Survey deleted')
            await fetchSurveys()
        } catch {
            toast.error('Failed to delete survey')
        }
    }

    const handleEditSuccess = () => {
        setEditSurvey(null)
        fetchSurveys()
    }

    // Compute stats
    const avgRating = pagination.total > 0 && surveys.length > 0
        ? (surveys.reduce((s, sv) => s + sv.rating, 0) / surveys.length)
        : 0

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => router.push('/admin/surveys')}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Surveys: {adProductName}
                    </h1>
                    <p className="mt-1 text-gray-600">
                        {pagination.total} total surveys
                        {avgRating > 0 && (
                            <span className="ml-3 inline-flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                {avgRating.toFixed(2)} avg rating (this page)
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <Card className="gap-4">
                <CardHeader />
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {surveys.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                                                No survey records
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        surveys.map((survey) => (
                                            <TableRow key={survey.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                        <span className="font-medium">{survey.rating}</span>
                                                        <span className="text-gray-400">/ 10</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-600 font-mono text-sm">
                                                    {survey.ip}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {new Date(survey.createdAt).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setEditSurvey(survey)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Survey</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete this survey record? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(survey.id)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-gray-500">
                                    Showing {pagination.total === 0 ? 0 : (currentPage - 1) * pagination.limit + 1} to{' '}
                                    {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} surveys
                                </div>
                                <div className="flex space-x-2">
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
                        </>
                    )}
                </CardContent>
            </Card>

            {editSurvey && (
                <SurveyEditDialog
                    survey={editSurvey}
                    open={!!editSurvey}
                    onOpenChange={(open) => { if (!open) setEditSurvey(null) }}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    )
}
