import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArticleForm } from '@/components/admin/ArticleForm'

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    const { id } = await params

    const [article, categories] = await Promise.all([
        prisma.article.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                slug: true,
                short_description: true,
                content: true,
                image: true,
                category_id: true,
                published_date: true,
                status: true,
                meta_title: true,
                meta_description: true,
            },
        }),
        prisma.category.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        }),
    ])

    if (!article) redirect('/admin/articles')

    const formattedArticle = {
        ...article,
        published_date: article.published_date
            ? article.published_date.toISOString().split('T')[0]
            : '',
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
                <p className="mt-2 text-gray-600">Update article content</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <ArticleForm initialData={formattedArticle} categories={categories} />
            </div>
        </div>
    )
}
