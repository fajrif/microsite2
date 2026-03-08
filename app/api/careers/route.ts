import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'

// GET /api/careers
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const page = Number.parseInt(searchParams.get('page') || '1')
        const limit = Number.parseInt(searchParams.get('limit') || '10')
        const status = searchParams.get('status')
        const department = searchParams.get('department')

        // Build where clause
        const where: any = {}

        if (status) {
            where.status = status
        }

        if (department) {
            where.department = department
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { short_description: { contains: search, mode: 'insensitive' } },
                { department: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
            ]
        }

        // Get total count for pagination
        const total = await prisma.career.count({ where })

        // Get paginated careers
        const careers = await prisma.career.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        })

        return NextResponse.json({
            careers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching careers:', error)
        return NextResponse.json(
            { error: 'Failed to fetch careers' },
            { status: 500 }
        )
    }
}

// POST /api/careers
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()

        // Parse form data
        const data = {
            title: formData.get('title') as string,
            slug: formData.get('slug') as string || generateSlug(formData.get('title') as string),
            department: formData.get('department') as string,
            location: formData.get('location') as string,
            employment_type: (formData.get('employment_type') as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP') || 'FULL_TIME',
            short_description: formData.get('short_description') as string || undefined,
            content: formData.get('content') as string || undefined,
            requirements: formData.get('requirements') as string || undefined,
            benefits: formData.get('benefits') as string || undefined,
            salary_range: formData.get('salary_range') as string || undefined,
            published_date: formData.get('published_date')
                ? new Date(formData.get('published_date') as string)
                : undefined,
            status: (formData.get('status') as 'DRAFT' | 'PUBLISHED') || 'DRAFT',
            meta_title: formData.get('meta_title') as string || undefined,
            meta_description: formData.get('meta_description') as string || undefined,
        }

        // Check if slug already exists
        const existingCareer = await prisma.career.findUnique({
            where: { slug: data.slug },
        })

        if (existingCareer) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 400 }
            )
        }

        const career = await prisma.career.create({
            data,
        })

        return NextResponse.json(career, { status: 201 })
    } catch (error) {
        console.error('Error creating career:', error)
        return NextResponse.json(
            { error: 'Failed to create career' },
            { status: 500 }
        )
    }
}
