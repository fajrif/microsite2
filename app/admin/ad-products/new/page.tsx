import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdProductForm } from '@/components/admin/AdProductForm'

export default async function NewAdProductPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Add Ad Product</h1>
                <p className="mt-2 text-gray-600">Create a new ad product</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <AdProductForm />
            </div>
        </div>
    )
}
