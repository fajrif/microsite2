import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ShowcaseShowClient } from './ShowcaseShowClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const showcase = await prisma.showcase.findUnique({
        where: { slug: id },
        select: { name: true, tagline: true },
    })

    if (!showcase) return { title: '未找到展示区' }

    return {
        title: `${showcase.name} | Spotify 广告`,
        description: showcase.tagline,
    }
}

export default async function ShowcaseDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const showcase = await prisma.showcase.findUnique({
        where: { slug: id },
        include: {
            classification: true,
            samples: { orderBy: { orderNo: 'asc' } },
            metrics: { orderBy: { orderNo: 'asc' } },
        },
    })

    if (!showcase) notFound()

    const allClassifications = await prisma.classification.findMany({
        select: {
            id: true,
            name: true,
            showcases: {
                select: { id: true, name: true, slug: true },
                orderBy: { orderNo: 'asc' },
            },
        },
        orderBy: { orderNo: 'asc' },
    })

    return (
        <ShowcaseShowClient
            showcase={showcase}
            allClassifications={allClassifications}
        />
    )
}
