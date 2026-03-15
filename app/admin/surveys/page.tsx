import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SurveysClient } from '@/components/admin/SurveysClient'

export default async function SurveysPage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect('/admin/login')
    }

    return <SurveysClient />
}
