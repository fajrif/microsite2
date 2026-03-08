import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ShowcaseForm } from '@/components/admin/ShowcaseForm'

export default async function NewShowcasePage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    const classifications = await prisma.classification.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    })

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Add Showcase</h1>
                <p className="mt-2 text-gray-600">Create a new showcase with samples and metrics</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <ShowcaseForm classifications={classifications} />
            </div>
        </div>
    )
}
