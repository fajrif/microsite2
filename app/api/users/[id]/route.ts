import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { userUpdateSchema } from '@/lib/validations/user'
import bcrypt from 'bcryptjs'

// GET /api/users/[id]
export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
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

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        )
    }
}

// PUT /api/users/[id]
export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = userUpdateSchema.parse(body)

        if (validatedData.username) {
            const existingUser = await prisma.user.findUnique({
                where: { username: validatedData.username },
            })

            if (existingUser && existingUser.id !== params.id) {
                return NextResponse.json(
                    { error: 'Username already exists' },
                    { status: 400 }
                )
            }
        }

        const updateData: Record<string, unknown> = {
            username: validatedData.username,
            full_name: validatedData.full_name,
            phone: validatedData.phone || null,
            company: validatedData.company || null,
        }

        if (validatedData.password) {
            updateData.password_hash = await bcrypt.hash(validatedData.password, 10)
        }

        const user = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
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

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error updating user:', error)
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid data', details: error },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        )
    }
}

// DELETE /api/users/[id]
export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.user.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        )
    }
}
