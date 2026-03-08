import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { classificationSchema } from '@/lib/validations/classification'
import { put } from '@vercel/blob'

// GET /api/classifications - List all classifications with search and pagination
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const page = Number.parseInt(searchParams.get('page') || '1')
        const limit = Number.parseInt(searchParams.get('limit') || '10')
        const all = searchParams.get('all')

        // Build where clause
        const where: any = {}

        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive',
            }
        }

        // Return all classifications without pagination (for selects)
        if (all === 'true') {
            const classifications = await prisma.classification.findMany({
                where,
                orderBy: { orderNo: 'asc' },
            })
            return NextResponse.json({ classifications })
        }

        // Return classifications with their showcases (for sidebar tree)
        const withShowcases = searchParams.get('withShowcases')
        if (withShowcases === 'true') {
            const classifications = await prisma.classification.findMany({
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
            return NextResponse.json({ classifications })
        }

        // Get total count for pagination
        const total = await prisma.classification.count({ where })

        // Get paginated classifications
        const classifications = await prisma.classification.findMany({
            where,
            orderBy: { orderNo: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                _count: {
                    select: { showcases: true },
                },
            },
        })

        return NextResponse.json({
            classifications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching classifications:', error)
        return NextResponse.json(
            { error: 'Failed to fetch classifications' },
            { status: 500 }
        )
    }
}

// POST /api/classifications - Create new classification
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const image = formData.get('image') as File | null
        let imageUrl: string | null = null

        // Handle image upload
        if (image && image.size > 0) {
            if (process.env.BLOB_READ_WRITE_TOKEN) {
                const blob = await put(image.name, image, {
                    access: 'public',
                    addRandomSuffix: true,
                })
                imageUrl = blob.url
            } else {
                const bytes = await image.arrayBuffer()
                const buffer = Buffer.from(bytes)
                const fileName = `${Date.now()}-${image.name}`
                const fs = await import('fs/promises')
                const path = await import('path')

                const uploadDir = path.join(process.cwd(), 'public', 'uploads')
                await fs.mkdir(uploadDir, { recursive: true })
                await fs.writeFile(path.join(uploadDir, fileName), buffer)
                imageUrl = `/uploads/${fileName}`
            }
        }

        const data = {
            name: formData.get('name') as string,
            description: (formData.get('description') as string) || undefined,
            orderNo: parseInt(formData.get('orderNo') as string || '0') || 0,
        }

        const validatedData = classificationSchema.parse(data)

        // Check if name already exists (case-insensitive)
        const existing = await prisma.classification.findFirst({
            where: {
                name: {
                    equals: validatedData.name,
                    mode: 'insensitive',
                },
            },
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Classification name already exists' },
                { status: 400 }
            )
        }

        const classification = await prisma.classification.create({
            data: {
                ...validatedData,
                image: imageUrl,
            },
        })

        return NextResponse.json(classification, { status: 201 })
    } catch (error) {
        console.error('Error creating classification:', error)
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid data', details: error },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to create classification' },
            { status: 500 }
        )
    }
}
