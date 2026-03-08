import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdProductsClient } from '@/components/admin/AdProductsClient'

export default async function AdProductsPage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect('/admin/login')
    }

    return <AdProductsClient />
}
