import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { FeaturesClient } from '@/components/admin/FeaturesClient'

export default async function FeaturesPage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect('/admin/login')
    }

    return <FeaturesClient />
}
