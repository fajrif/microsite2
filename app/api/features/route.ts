import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { featureSchema } from '@/lib/validations/ad-product'

// GET /api/features
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const page = Number.parseInt(searchParams.get('page') || '1')
        const limit = Number.parseInt(searchParams.get('limit') || '10')
        const adProductId = searchParams.get('ad_product_id')

        const where: any = {}

        if (adProductId) {
            where.ad_product_id = adProductId
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
            ]
        }

        const total = await prisma.feature.count({ where })

        const features = await prisma.feature.findMany({
            where,
            include: {
                ad_product: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { orderNo: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
        })

        return NextResponse.json({
            features,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching features:', error)
        return NextResponse.json(
            { error: 'Failed to fetch features' },
            { status: 500 }
        )
    }
}

// POST /api/features
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()

        const featureData = {
            name: formData.get('name') as string,
            ad_product_id: formData.get('ad_product_id') as string,
            caption: (formData.get('caption') as string) || undefined,
            description: (formData.get('description') as string) || undefined,
            orderNo: formData.get('orderNo') ? parseInt(formData.get('orderNo') as string) || 0 : 0,
        }

        const validatedData = featureSchema.parse(featureData)

        // Verify ad product exists
        const adProduct = await prisma.adProduct.findUnique({
            where: { id: featureData.ad_product_id },
        })

        if (!adProduct) {
            return NextResponse.json(
                { error: 'Ad product not found' },
                { status: 400 }
            )
        }

        // Handle URLs (pre-uploaded by client)
        const imageUrl = formData.get('image_url') as string | null
        if (!imageUrl) {
            return NextResponse.json(
                { error: 'Image is required' },
                { status: 400 }
            )
        }

        const audioUrl = (formData.get('audio_url') as string) || undefined
        const videoUrl = (formData.get('video_url') as string) || undefined

        const feature = await prisma.feature.create({
            data: {
                ...validatedData,
                ad_product_id: featureData.ad_product_id,
                image: imageUrl,
                audio_link: audioUrl,
                video_link: videoUrl,
            },
            include: {
                ad_product: true,
            },
        })

        return NextResponse.json(feature, { status: 201 })
    } catch (error) {
        console.error('Error creating feature:', error)
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid data', details: error },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to create feature' },
            { status: 500 }
        )
    }
}
