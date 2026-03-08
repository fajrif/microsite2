import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ShowcaseForm } from '@/components/admin/ShowcaseForm'

export default async function EditShowcasePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    const { id } = await params

    const [showcase, classifications] = await Promise.all([
        prisma.showcase.findUnique({
            where: { id },
            include: {
                classification: true,
                samples: true,
                metrics: true,
            },
        }),
        prisma.classification.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        }),
    ])

    if (!showcase) {
        redirect('/admin/showcases')
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Showcase</h1>
                <p className="mt-2 text-gray-600">Update showcase details, samples, and metrics</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <ShowcaseForm initialData={showcase} classifications={classifications} />
            </div>
        </div>
    )
}
