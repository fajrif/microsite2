import { prisma } from '@/lib/prisma'
import { HomeClient } from './HomeClient'

export const metadata = {
    title: 'Spotify Advertising',
    description: 'Explore our ad products - an interactive walk-through.',
}

export default async function HomePage() {
    const adProducts = await prisma.adProduct.findMany({
        orderBy: { orderNo: 'asc' },
        include: {
            features: {
                orderBy: { orderNo: 'asc' },
            },
        },
    })

    return <HomeClient adProducts={adProducts} />
}
