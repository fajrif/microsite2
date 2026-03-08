import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { articleSchema } from '@/lib/validations/article'
import { uploadFile } from '@/lib/storage'
import { generateSlug } from '@/lib/slug'

// GET /api/articles
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const page = Number.parseInt(searchParams.get('page') || '1')
        const limit = Number.parseInt(searchParams.get('limit') || '10')
        const status = searchParams.get('status')

        // Build where clause
        const where: any = {}

        if (status) {
            where.status = status
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { short_description: { contains: search, mode: 'insensitive' } },
            ]
        }

        // Get total count for pagination
        const total = await prisma.article.count({ where })

        // Get paginated articles
        const articles = await prisma.article.findMany({
            where,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        })

        return NextResponse.json({
            articles,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching articles:', error)
        return NextResponse.json(
            { error: 'Failed to fetch articles' },
            { status: 500 }
        )
    }
}

// POST /api/articles
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const image = formData.get('image') as File | null
        let imageUrl: string | null = null

        // Handle main image upload
        if (image && image.size > 0) {
            imageUrl = await uploadFile(image, image.name)
        }

        // Handle gallery images upload
        const galleryImages: string[] = []
        const galleryFiles = formData.getAll('gallery_images') as File[]

        for (const file of galleryFiles) {
            if (file && file.size > 0) {
                galleryImages.push(await uploadFile(file, file.name))
            }
        }

        // Parse form data
        const data = {
            title: formData.get('title') as string,
            slug: formData.get('slug') as string || generateSlug(formData.get('title') as string),
            short_description: formData.get('short_description') as string || undefined,
            content: formData.get('content') as string || undefined,
            category_id: formData.get('category_id') as string,
            published_date: formData.get('published_date')
                ? new Date(formData.get('published_date') as string)
                : undefined,
            status: (formData.get('status') as 'DRAFT' | 'PUBLISHED') || 'DRAFT',
            meta_title: formData.get('meta_title') as string || undefined,
            meta_description: formData.get('meta_description') as string || undefined,
        }

        // Check if slug already exists
        const existingArticle = await prisma.article.findUnique({
            where: { slug: data.slug },
        })

        if (existingArticle) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 400 }
            )
        }

        const article = await prisma.article.create({
            data: {
                ...data,
                image: imageUrl,
                gallery_images: galleryImages,
            },
            include: {
                category: true,
            },
        })

        return NextResponse.json(article, { status: 201 })
    } catch (error) {
        console.error('Error creating article:', error)
        return NextResponse.json(
            { error: 'Failed to create article' },
            { status: 500 }
        )
    }
}
