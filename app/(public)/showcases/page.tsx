import { prisma } from '@/lib/prisma'
import { ShowcasesIndexClient } from './ShowcasesIndexClient'

export const metadata = {
    title: 'Spotify 广告',
    description: '五大创意类型最佳实',
}

export default async function ShowcasesPage() {
    const classifications = await prisma.classification.findMany({
        orderBy: { orderNo: 'asc' },
        include: {
            showcases: {
                orderBy: { orderNo: 'asc' },
                include: {
                    samples: { orderBy: { orderNo: 'asc' } },
                    metrics: { orderBy: { orderNo: 'asc' } },
                },
            },
        },
    })

    return <ShowcasesIndexClient classifications={classifications} />
}
