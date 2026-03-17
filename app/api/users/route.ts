import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { userSchema } from '@/lib/validations/user'
import bcrypt from 'bcryptjs'

// GET /api/users - List users with search and pagination
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const search = searchParams.get('search') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        const where = search
            ? {
                OR: [
                    { full_name: { contains: search, mode: 'insensitive' as const } },
                    { username: { contains: search, mode: 'insensitive' as const } },
                    { company: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {}

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    username: true,
                    full_name: true,
                    phone: true,
                    company: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.user.count({ where }),
        ])

        const totalPages = Math.ceil(total / limit)

        return NextResponse.json({
            users,
            pagination: { total, page, limit, totalPages },
        })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}

// POST /api/users - Create new user
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = userSchema.parse(body)

        const existingUser = await prisma.user.findUnique({
            where: { username: validatedData.username },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 400 }
            )
        }

        const password_hash = await bcrypt.hash(validatedData.password, 10)

        const user = await prisma.user.create({
            data: {
                username: validatedData.username,
                full_name: validatedData.full_name,
                phone: validatedData.phone || null,
                company: validatedData.company || null,
                password_hash,
            },
            select: {
                id: true,
                username: true,
                full_name: true,
                phone: true,
                company: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        console.error('Error creating user:', error)
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid data', details: error },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        )
    }
}
