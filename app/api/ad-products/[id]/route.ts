import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { adProductSchema } from '@/lib/validations/ad-product'
import { generateSlug } from '@/lib/slug'

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

        // Handle image upload (optional on update)
        let imageUpdate: { image?: string } = {}
        const imageFile = formData.get('image') as File | null
        if (imageFile && imageFile.size > 0) {
            imageUpdate.image = await uploadFileLocal(imageFile)
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
