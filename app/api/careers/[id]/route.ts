import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/careers/[id]
export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const career = await prisma.career.findUnique({
            where: { id: params.id },
        })

        if (!career) {
            return NextResponse.json(
                { error: 'Career not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(career)
    } catch (error) {
        console.error('Error fetching career:', error)
        return NextResponse.json(
            { error: 'Failed to fetch career' },
            { status: 500 }
        )
    }
}

// PUT /api/careers/[id]
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

        const formData = await request.formData()

        const data: any = {
            title: formData.get('title') as string,
            slug: formData.get('slug') as string,
            department: formData.get('department') as string,
            location: formData.get('location') as string,
            employment_type: formData.get('employment_type') as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP',
            short_description: formData.get('short_description') as string || null,
            content: formData.get('content') as string || null,
            requirements: formData.get('requirements') as string || null,
            benefits: formData.get('benefits') as string || null,
            salary_range: formData.get('salary_range') as string || null,
            published_date: formData.get('published_date')
                ? new Date(formData.get('published_date') as string)
                : null,
            status: formData.get('status') as 'DRAFT' | 'PUBLISHED',
            meta_title: formData.get('meta_title') as string || null,
            meta_description: formData.get('meta_description') as string || null,
        }

        // Check if slug already exists (excluding current career)
        const existingCareer = await prisma.career.findUnique({
            where: { slug: data.slug },
        })

        if (existingCareer && existingCareer.id !== params.id) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 400 }
            )
        }

        const career = await prisma.career.update({
            where: { id: params.id },
            data,
        })

        return NextResponse.json(career)
    } catch (error) {
        console.error('Error updating career:', error)
        return NextResponse.json(
            { error: 'Failed to update career' },
            { status: 500 }
        )
    }
}

// DELETE /api/careers/[id]
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

        await prisma.career.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting career:', error)
        return NextResponse.json(
            { error: 'Failed to delete career' },
            { status: 500 }
        )
    }
}
