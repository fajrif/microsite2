import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { categorySchema } from '@/lib/validations/category'

// GET /api/categories - List all categories with search and pagination
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const page = Number.parseInt(searchParams.get('page') || '1')
        const limit = Number.parseInt(searchParams.get('limit') || '10')

        // Build where clause
        const where: any = {}

        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive',
            }
        }

        // Get total count for pagination
        const total = await prisma.category.count({ where })

        // Get paginated categories
        const categories = await prisma.category.findMany({
            where,
            orderBy: { name: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
        })

        return NextResponse.json({
            categories,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}

// POST /api/categories - Create new category
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = categorySchema.parse(body)

        // Check if category name already exists (case-insensitive)
        const existing = await prisma.category.findFirst({
            where: {
                name: {
                    equals: validatedData.name,
                    mode: 'insensitive'
                }
            }
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Category name already exists' },
                { status: 400 }
            )
        }

        const category = await prisma.category.create({
            data: validatedData,
        })

        return NextResponse.json(category, { status: 201 })
    } catch (error) {
        console.error('Error creating category:', error)
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid data', details: error },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        )
    }
}
