import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { classificationSchema } from '@/lib/validations/classification'
import { put, del } from '@vercel/blob'

async function deleteBlobIfExists(url: string | null | undefined) {
    if (url && url.includes('blob.vercel-storage.com')) {
        try {
            await del(url)
        } catch (error) {
            console.error('Error deleting blob:', error)
        }
    }
}

// GET /api/classifications/[id]
export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const classification = await prisma.classification.findUnique({
            where: { id: params.id },
            include: {
                showcases: {
                    orderBy: { orderNo: 'asc' },
                    include: {
                        samples: { orderBy: { orderNo: 'asc' } },
                        metrics: { orderBy: { orderNo: 'asc' } },
                    },
                },
            },
        })

        if (!classification) {
            return NextResponse.json(
                { error: 'Classification not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(classification)
    } catch (error) {
        console.error('Error fetching classification:', error)
        return NextResponse.json(
            { error: 'Failed to fetch classification' },
            { status: 500 }
        )
    }
}

// PUT /api/classifications/[id]
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
        const image = formData.get('image') as File | null
        let imageUrl: string | null | undefined = undefined

        // Get current classification
        const current = await prisma.classification.findUnique({
            where: { id: params.id },
            select: { image: true },
        })

        // Handle image upload
        if (image && image.size > 0) {
            if (current?.image) {
                await deleteBlobIfExists(current.image)
            }

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

        // Check uniqueness excluding current
        const existing = await prisma.classification.findFirst({
            where: {
                name: {
                    equals: validatedData.name,
                    mode: 'insensitive',
                },
                NOT: { id: params.id },
            },
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Classification name already exists' },
                { status: 400 }
            )
        }

        const updateData: any = { ...validatedData }
        if (imageUrl !== undefined) {
            updateData.image = imageUrl
        }

        const classification = await prisma.classification.update({
            where: { id: params.id },
            data: updateData,
        })

        return NextResponse.json(classification)
    } catch (error) {
        console.error('Error updating classification:', error)
        return NextResponse.json(
            { error: 'Failed to update classification' },
            { status: 500 }
        )
    }
}

// DELETE /api/classifications/[id]
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

        const classification = await prisma.classification.findUnique({
            where: { id: params.id },
            select: { image: true },
        })

        if (classification?.image) {
            await deleteBlobIfExists(classification.image)
        }

        await prisma.classification.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting classification:', error)
        return NextResponse.json(
            { error: 'Failed to delete classification' },
            { status: 500 }
        )
    }
}
