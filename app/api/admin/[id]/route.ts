import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { adminUpdateSchema } from '@/lib/validations/admin'
import bcrypt from 'bcryptjs'

// GET /api/admin/[id] - Get single admin
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

        const admin = await prisma.admin.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                email: true,
                full_name: true,
                phone: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        if (!admin) {
            return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
        }

        return NextResponse.json(admin)
    } catch (error) {
        console.error('Error fetching admin:', error)
        return NextResponse.json(
            { error: 'Failed to fetch admin' },
            { status: 500 }
        )
    }
}

// PUT /api/admin/[id] - Update admin
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
        const validatedData = adminUpdateSchema.parse(body)

        // Check if email already exists (excluding current admin)
        if (validatedData.email) {
            const existingAdmin = await prisma.admin.findUnique({
                where: { email: validatedData.email },
            })

            if (existingAdmin && existingAdmin.id !== params.id) {
                return NextResponse.json(
                    { error: 'Email already exists' },
                    { status: 400 }
                )
            }
        }

        const updateData: any = {
            email: validatedData.email,
            full_name: validatedData.full_name,
            phone: validatedData.phone || null,
        }

        // Only update password if provided
        if (validatedData.password) {
            updateData.password_hash = await bcrypt.hash(validatedData.password, 10)
        }

        const admin = await prisma.admin.update({
            where: { id: params.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                full_name: true,
                phone: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        return NextResponse.json(admin)
    } catch (error) {
        console.error('Error updating admin:', error)
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid data', details: error },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to update admin' },
            { status: 500 }
        )
    }
}

// DELETE /api/admin/[id] - Delete admin
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

        // Don't allow deleting yourself
        if (session.user.id === params.id) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            )
        }

        await prisma.admin.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting admin:', error)
        return NextResponse.json(
            { error: 'Failed to delete admin' },
            { status: 500 }
        )
    }
}
