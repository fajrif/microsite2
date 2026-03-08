import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CareerForm } from '@/components/admin/CareerForm'

export default async function EditCareerPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    const { id } = await params

    const career = await prisma.career.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            slug: true,
            department: true,
            location: true,
            employment_type: true,
            short_description: true,
            content: true,
            requirements: true,
            benefits: true,
            salary_range: true,
            published_date: true,
            status: true,
            meta_title: true,
            meta_description: true,
        },
    })

    if (!career) redirect('/admin/careers')

    const formattedCareer = {
        ...career,
        published_date: career.published_date
            ? career.published_date.toISOString().split('T')[0]
            : '',
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Career</h1>
                <p className="mt-2 text-gray-600">Update job listing details</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <CareerForm initialData={formattedCareer} />
            </div>
        </div>
    )
}
