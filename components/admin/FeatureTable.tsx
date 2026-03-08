'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'

interface Feature {
    id: string
    name: string
    orderNo: number
    image: string
    video_link: string | null
    audio_link: string | null
    ad_product: { id: string; name: string }
    createdAt: Date
}

interface FeatureTableProps {
    features: Feature[]
    isLoading: boolean
    onDelete: (id: string) => Promise<void>
}

export function FeatureTable({ features, isLoading, onDelete }: FeatureTableProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteClick = async () => {
        if (!deleteId) return
        setIsDeleting(true)
        try {
            await onDelete(deleteId)
            setDeleteId(null)
        } catch (error) {
            console.error('Delete error:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="text-center py-8 text-gray-500">
                Loading...
            </div>
        )
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Ad Product</TableHead>
                            <TableHead>Media</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {features.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                    No features found
                                </TableCell>
                            </TableRow>
                        ) : (
                            features.map((feature) => (
                                <TableRow key={feature.id}>
                                    <TableCell className="text-gray-600 font-mono text-sm">
                                        {feature.orderNo}
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-12 h-12 relative rounded overflow-hidden">
                                            <Image
                                                src={feature.image}
                                                alt={feature.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium max-w-[200px]">
                                        <Link
                                            href={`/admin/features/${feature.id}/edit`}
                                            className="hover:text-blue-600 hover:underline truncate block"
                                            title={feature.name}
                                        >
                                            {feature.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{feature.ad_product.name}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {feature.video_link && (
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Video</span>
                                            )}
                                            {feature.audio_link && (
                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Audio</span>
                                            )}
                                            {!feature.video_link && !feature.audio_link && (
                                                <span className="text-xs text-gray-400">None</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(feature.createdAt), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/features/${feature.id}/edit`}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => setDeleteId(feature.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the feature.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteClick} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
