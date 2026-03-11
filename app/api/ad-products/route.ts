import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { adProductSchema } from '@/lib/validations/ad-product'
import { generateSlug } from '@/lib/slug'
import { uploadFile } from '@/lib/storage'

// GET /api/ad-products
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const page = Number.parseInt(searchParams.get('page') || '1')
        const limit = Number.parseInt(searchParams.get('limit') || '10')
        const all = searchParams.get('all') === 'true'

        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { tagline: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (all) {
            const adProducts = await prisma.adProduct.findMany({
                where,
                include: {
                    features: {
                        orderBy: { orderNo: 'asc' },
                    },
                },
                orderBy: { orderNo: 'asc' },
            })
            return NextResponse.json({ adProducts })
        }

        const total = await prisma.adProduct.count({ where })

        const adProducts = await prisma.adProduct.findMany({
            where,
            include: {
                _count: {
                    select: { features: true },
                },
            },
            orderBy: { orderNo: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
        })

        return NextResponse.json({
            adProducts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching ad products:', error)
        return NextResponse.json(
            { error: 'Failed to fetch ad products' },
            { status: 500 }
        )
    }
}

// POST /api/ad-products
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()

        const adProductData = {
            name: formData.get('name') as string,
            tagline: formData.get('tagline') as string,
            description: (formData.get('description') as string) || undefined,
            orderNo: formData.get('orderNo') ? parseInt(formData.get('orderNo') as string) || 0 : 0,
        }

        const validatedData = adProductSchema.parse(adProductData)

        // Check uniqueness
        const existing = await prisma.adProduct.findFirst({
            where: {
                name: { equals: validatedData.name, mode: 'insensitive' },
            },
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Ad product name already exists' },
                { status: 400 }
            )
        }

        // Generate unique slug
        let slug = generateSlug(validatedData.name)
        let slugSuffix = 2
        while (await prisma.adProduct.findUnique({ where: { slug } })) {
            slug = `${generateSlug(validatedData.name)}-${slugSuffix}`
            slugSuffix++
        }

        // Handle image upload
        const imageFile = formData.get('image') as File | null
        if (!imageFile || imageFile.size === 0) {
            return NextResponse.json(
                { error: 'Image is required' },
                { status: 400 }
            )
        }

        const imageUrl = await uploadFile(imageFile)

        const adProduct = await prisma.adProduct.create({
            data: {
                ...validatedData,
                slug,
                image: imageUrl,
            },
            include: {
                features: true,
            },
        })

        return NextResponse.json(adProduct, { status: 201 })
    } catch (error) {
        console.error('Error creating ad product:', error)
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid data', details: error },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to create ad product' },
            { status: 500 }
        )
    }
}
