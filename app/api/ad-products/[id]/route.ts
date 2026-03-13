import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { adProductSchema } from '@/lib/validations/ad-product'
import { generateSlug } from '@/lib/slug'
import { deleteFile } from '@/lib/storage'

// GET /api/ad-products/[id]
export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const adProduct = await prisma.adProduct.findUnique({
            where: { id: params.id },
            include: {
                features: { orderBy: { orderNo: 'asc' } },
            },
        })

        if (!adProduct) {
            return NextResponse.json(
                { error: 'Ad product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(adProduct)
    } catch (error) {
        console.error('Error fetching ad product:', error)
        return NextResponse.json(
            { error: 'Failed to fetch ad product' },
            { status: 500 }
        )
    }
}

// PUT /api/ad-products/[id]
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

        const current = await prisma.adProduct.findUnique({
            where: { id: params.id },
        })

        if (!current) {
            return NextResponse.json(
                { error: 'Ad product not found' },
                { status: 404 }
            )
        }

        const adProductData = {
            name: formData.get('name') as string,
            tagline: formData.get('tagline') as string,
            description: (formData.get('description') as string) || undefined,
            orderNo: formData.get('orderNo') ? parseInt(formData.get('orderNo') as string) || 0 : 0,
        }

        const validatedData = adProductSchema.parse(adProductData)

        // Check uniqueness excluding current
        const existing = await prisma.adProduct.findFirst({
            where: {
                name: { equals: validatedData.name, mode: 'insensitive' },
                NOT: { id: params.id },
            },
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Ad product name already exists' },
                { status: 400 }
            )
        }

        // Regenerate slug if name changed
        let slugUpdate: { slug?: string } = {}
        if (validatedData.name !== current.name) {
            let slug = generateSlug(validatedData.name)
            let slugSuffix = 2
            while (true) {
                const slugExists = await prisma.adProduct.findFirst({
                    where: { slug, NOT: { id: params.id } },
                })
                if (!slugExists) break
                slug = `${generateSlug(validatedData.name)}-${slugSuffix}`
                slugSuffix++
            }
            slugUpdate = { slug }
        }

        // Handle image URL (pre-uploaded by client, optional on update)
        let imageUpdate: { image?: string } = {}
        const imageUrl = formData.get('image_url') as string | null
        if (imageUrl) {
            await deleteFile(current.image)
            imageUpdate.image = imageUrl
        }

        const adProduct = await prisma.adProduct.update({
            where: { id: params.id },
            data: { ...validatedData, ...slugUpdate, ...imageUpdate },
            include: {
                features: { orderBy: { orderNo: 'asc' } },
            },
        })

        return NextResponse.json(adProduct)
    } catch (error) {
        console.error('Error updating ad product:', error)
        const message = error instanceof Error ? error.message : 'Failed to update ad product'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}

// DELETE /api/ad-products/[id]
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

        // Fetch with features to clean up all files
        const adProduct = await prisma.adProduct.findUnique({
            where: { id: params.id },
            include: { features: true },
        })

        if (!adProduct) {
            return NextResponse.json({ error: 'Ad product not found' }, { status: 404 })
        }

        // Delete all feature files
        for (const feature of adProduct.features) {
            await deleteFile(feature.image)
            await deleteFile(feature.audio_link)
            await deleteFile(feature.video_link)
        }

        // Delete ad product image
        await deleteFile(adProduct.image)

        await prisma.adProduct.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting ad product:', error)
        return NextResponse.json(
            { error: 'Failed to delete ad product' },
            { status: 500 }
        )
    }
}
