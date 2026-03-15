import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SurveyDetailClient } from '@/components/admin/SurveyDetailClient'

export default async function SurveyDetailPage({
    params,
}: {
    params: Promise<{ adProductId: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect('/admin/login')
    }

    const { adProductId } = await params

    return <SurveyDetailClient adProductId={adProductId} />
}
