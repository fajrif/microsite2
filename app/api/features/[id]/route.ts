import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { featureSchema } from '@/lib/validations/ad-product'
import { uploadFile, deleteFile } from '@/lib/storage'

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
        // Note: image is required field, so no removal - only replacement
        let imageUpdate: { image?: string } = {}
        const imageFile = formData.get('image') as File | null
        if (imageFile && imageFile.size > 0) {
            await deleteFile(current.image)
            imageUpdate.image = await uploadFile(imageFile)
        }

        // Handle audio removal/upload
        const removeAudio = formData.get('remove_audio') === 'true'
        let audioUpdate: { audio_link?: string | null } = {}

        if (removeAudio) {
            await deleteFile(current.audio_link)
            audioUpdate.audio_link = null
        } else {
            const audioFile = formData.get('audio') as File | null
            if (audioFile && audioFile.size > 0) {
                await deleteFile(current.audio_link)
                audioUpdate.audio_link = await uploadFile(audioFile)
            }
        }

        // Handle video removal/upload
        const removeVideo = formData.get('remove_video') === 'true'
        let videoUpdate: { video_link?: string | null } = {}

        if (removeVideo) {
            await deleteFile(current.video_link)
            videoUpdate.video_link = null
        } else {
            const videoFile = formData.get('video') as File | null
            if (videoFile && videoFile.size > 0) {
                await deleteFile(current.video_link)
                videoUpdate.video_link = await uploadFile(videoFile)
            }
        }

        const feature = await prisma.feature.update({
            where: { id: params.id },
            data: {
                ...validatedData,
                ad_product_id: featureData.ad_product_id,
                ...imageUpdate,
                ...audioUpdate,
                ...videoUpdate,
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

        const feature = await prisma.feature.findUnique({
            where: { id: params.id },
        })

        if (!feature) {
            return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
        }

        // Clean up all files
        await deleteFile(feature.image)
        await deleteFile(feature.audio_link)
        await deleteFile(feature.video_link)

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
