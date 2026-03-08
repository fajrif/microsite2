import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ClassificationsClient } from '@/components/admin/ClassificationsClient'

export default async function ClassificationsPage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect('/admin/login')
    }

    return <ClassificationsClient />
}
