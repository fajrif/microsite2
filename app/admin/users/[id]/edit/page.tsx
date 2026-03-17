import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserForm } from '@/components/admin/UserForm'

export default async function EditUserPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect('/admin/login')
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            full_name: true,
            phone: true,
            company: true,
        },
    })

    if (!user) {
        redirect('/admin/users')
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
                <p className="mt-2 text-gray-600">Update site user account</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <UserForm initialData={user} />
            </div>
        </div>
    )
}
