'use client'

import { useState, useEffect } from 'react'
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
import { Star, Eye } from 'lucide-react'

interface SurveySummary {
    id: string
    name: string
    slug: string
    totalSurveys: number
    averageRating: number
}

export function SurveysClient() {
    const router = useRouter()
    const [summary, setSummary] = useState<SurveySummary[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchSummary() {
            try {
                const res = await fetch('/api/surveys/summary')
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setSummary(data.summary)
            } catch {
                toast.error('Failed to load survey summary')
            } finally {
                setIsLoading(false)
            }
        }
        fetchSummary()
    }, [])

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Surveys</h1>
                <p className="mt-2 text-gray-600">Survey ratings per Ad Product</p>
            </div>
            <Card className="gap-4">
                <CardHeader />
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ad Product</TableHead>
                                    <TableHead className="text-center">Total Surveys</TableHead>
                                    <TableHead className="text-center">Average Rating</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {summary.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                                            No survey data yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    summary.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-center">{item.totalSurveys}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    <span>{item.averageRating > 0 ? item.averageRating.toFixed(2) : '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/admin/surveys/${item.id}`)}
                                                    disabled={item.totalSurveys === 0}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
