import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ArticlesClient } from '@/components/admin/ArticlesClient'

export default async function ArticlesPage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect('/admin/login')
    }

    return <ArticlesClient />
}
