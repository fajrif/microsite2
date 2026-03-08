import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdProductForm } from '@/components/admin/AdProductForm'

export default async function EditAdProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    const { id } = await params

    const adProduct = await prisma.adProduct.findUnique({
        where: { id },
        include: {
            features: { orderBy: { orderNo: 'asc' } },
        },
    })

    if (!adProduct) {
        redirect('/admin/ad-products')
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Ad Product</h1>
                <p className="mt-2 text-gray-600">Update ad product details</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <AdProductForm initialData={adProduct} />
            </div>
        </div>
    )
}
