import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FeatureForm } from '@/components/admin/FeatureForm'

export default async function EditFeaturePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    const { id } = await params

    const [feature, adProducts] = await Promise.all([
        prisma.feature.findUnique({
            where: { id },
            include: {
                ad_product: true,
            },
        }),
        prisma.adProduct.findMany({
            select: { id: true, name: true },
            orderBy: { orderNo: 'asc' },
        }),
    ])

    if (!feature) {
        redirect('/admin/features')
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Feature</h1>
                <p className="mt-2 text-gray-600">Update feature details</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <FeatureForm initialData={feature} adProducts={adProducts} />
            </div>
        </div>
    )
}
