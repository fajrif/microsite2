import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CategoriesClient } from '@/components/admin/CategoriesClient'

export default async function CategoriesPage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect('/admin/login')
    }

    return <CategoriesClient />
}
