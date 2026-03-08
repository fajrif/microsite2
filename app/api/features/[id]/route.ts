import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { featureSchema } from '@/lib/validations/ad-product'

async function uploadFileLocal(file: File): Promise<string> {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${Date.now()}-${file.name}`
    const fs = await import('fs/promises')
    const path = await import('path')

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    await fs.writeFile(path.join(uploadDir, fileName), buffer)
    return `/uploads/${fileName}`
}

// GET /api/features/[id]
export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const feature = await prisma.feature.findUnique({
            where: { id: params.id },
            include: {
                ad_product: true,
            },
        })

        if (!feature) {
            return NextResponse.json(
                { error: 'Feature not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(feature)
    } catch (error) {
        console.error('Error fetching feature:', error)
        return NextResponse.json(
            { error: 'Failed to fetch feature' },
            { status: 500 }
        )
    }
}

// PUT /api/features/[id]
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

        const current = await prisma.feature.findUnique({
            where: { id: params.id },
        })

        if (!current) {
            return NextResponse.json(
                { error: 'Feature not found' },
                { status: 404 }
            )
        }

        const featureData = {
            name: formData.get('name') as string,
            ad_product_id: formData.get('ad_product_id') as string,
            caption: (formData.get('caption') as string) || undefined,
            description: (formData.get('description') as string) || undefined,
            video_link: (formData.get('video_link') as string) || undefined,
            audio_link: (formData.get('audio_link') as string) || undefined,
            orderNo: formData.get('orderNo') ? parseInt(formData.get('orderNo') as string) || 0 : 0,
        }

        const validatedData = featureSchema.parse(featureData)

        // Verify ad product exists
        const adProduct = await prisma.adProduct.findUnique({
            where: { id: featureData.ad_product_id },
        })

        if (!adProduct) {
            return NextResponse.json(
                { error: 'Ad product not found' },
                { status: 400 }
            )
        }

        // Handle image upload (optional on update)
        let imageUpdate: { image?: string } = {}
        const imageFile = formData.get('image') as File | null
        if (imageFile && imageFile.size > 0) {
            imageUpdate.image = await uploadFileLocal(imageFile)
        }

        const feature = await prisma.feature.update({
            where: { id: params.id },
            data: {
                ...validatedData,
                ad_product_id: featureData.ad_product_id,
                ...imageUpdate,
            },
            include: {
                ad_product: true,
            },
        })

        return NextResponse.json(feature)
    } catch (error) {
        console.error('Error updating feature:', error)
        const message = error instanceof Error ? error.message : 'Failed to update feature'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}

// DELETE /api/features/[id]
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

        await prisma.feature.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting feature:', error)
        return NextResponse.json(
            { error: 'Failed to delete feature' },
            { status: 500 }
        )
    }
}
