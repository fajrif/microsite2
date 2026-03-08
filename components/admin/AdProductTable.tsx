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

interface AdProduct {
    id: string
    name: string
    tagline: string
    orderNo: number
    image: string
    _count: { features: number }
    createdAt: Date
}

interface AdProductTableProps {
    adProducts: AdProduct[]
    isLoading: boolean
    onDelete: (id: string) => Promise<void>
}

export function AdProductTable({ adProducts, isLoading, onDelete }: AdProductTableProps) {
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
                            <TableHead>Tagline</TableHead>
                            <TableHead>Features</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {adProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                    No ad products found
                                </TableCell>
                            </TableRow>
                        ) : (
                            adProducts.map((adProduct) => (
                                <TableRow key={adProduct.id}>
                                    <TableCell className="text-gray-600 font-mono text-sm">
                                        {adProduct.orderNo}
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-12 h-12 relative rounded overflow-hidden">
                                            <Image
                                                src={adProduct.image}
                                                alt={adProduct.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium max-w-[200px]">
                                        <Link
                                            href={`/admin/ad-products/${adProduct.id}/edit`}
                                            className="hover:text-blue-600 hover:underline truncate block"
                                            title={adProduct.name}
                                        >
                                            {adProduct.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="max-w-[250px] truncate">
                                        {adProduct.tagline}
                                    </TableCell>
                                    <TableCell>{adProduct._count.features}</TableCell>
                                    <TableCell>
                                        {format(new Date(adProduct.createdAt), 'MMM dd, yyyy')}
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
                                                    <Link href={`/admin/ad-products/${adProduct.id}/edit`}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => setDeleteId(adProduct.id)}
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
                            This action cannot be undone. This will permanently delete the
                            ad product and all its features.
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
