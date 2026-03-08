import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FeatureForm } from '@/components/admin/FeatureForm'

export default async function NewFeaturePage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    const adProducts = await prisma.adProduct.findMany({
        select: { id: true, name: true },
        orderBy: { orderNo: 'asc' },
    })

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Add Feature</h1>
                <p className="mt-2 text-gray-600">Create a new feature for an ad product</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <FeatureForm adProducts={adProducts} />
            </div>
        </div>
    )
}
