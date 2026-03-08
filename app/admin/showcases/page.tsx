import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ShowcasesClient } from '@/components/admin/ShowcasesClient'

export default async function ShowcasesPage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect('/admin/login')
    }

    return <ShowcasesClient />
}
