import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminForm } from '@/components/admin/AdminForm'

export default async function EditAdminPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect('/admin/login')
    }

    const { id } = await params

    const admin = await prisma.admin.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            full_name: true,
            phone: true,
        },
    })

    if (!admin) {
        redirect('/admin/admins')
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Admin</h1>
                <p className="mt-2 text-gray-600">Update administrator account</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <AdminForm initialData={admin} />
            </div>
        </div>
    )
}
