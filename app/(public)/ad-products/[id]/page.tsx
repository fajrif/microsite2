import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { AdProductShowClient } from './AdProductShowClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const adProduct = await prisma.adProduct.findUnique({
        where: { slug: id },
        select: { name: true, tagline: true },
    })

    if (!adProduct) return { title: 'Ad Product Not Found' }

    return {
        title: `${adProduct.name} | Spotify Advertising`,
        description: adProduct.tagline,
    }
}

export default async function AdProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const adProduct = await prisma.adProduct.findUnique({
        where: { slug: id },
        include: {
            features: { orderBy: { orderNo: 'asc' } },
        },
    })

    if (!adProduct) notFound()

    const allAdProducts = await prisma.adProduct.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            features: {
                select: { id: true, name: true },
                orderBy: { orderNo: 'asc' },
            },
        },
        orderBy: { orderNo: 'asc' },
    })

    return (
        <AdProductShowClient
            adProduct={adProduct}
            allAdProducts={allAdProducts}
        />
    )
}
