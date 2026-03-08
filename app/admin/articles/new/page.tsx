import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArticleForm } from '@/components/admin/ArticleForm'

export default async function NewArticlePage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    const categories = await prisma.category.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    })

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Add Article</h1>
                <p className="mt-2 text-gray-600">Create a new blog article</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <ArticleForm categories={categories} />
            </div>
        </div>
    )
}
