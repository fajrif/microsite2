import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadFile, deleteFile } from '@/lib/storage'
import { generateSlug } from '@/lib/slug'

// Helper function to delete stored files
async function deleteStoredFile(url: string | null | undefined) {
    if (url) {
        try {
            await deleteFile(url)
        } catch (error) {
            console.error('Error deleting file:', error)
        }
    }
}

// GET /api/articles/[id]
export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const article = await prisma.article.findUnique({
            where: { id: params.id },
            include: {
                category: true,
            },
        })

        if (!article) {
            return NextResponse.json(
                { error: 'Article not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(article)
    } catch (error) {
        console.error('Error fetching article:', error)
        return NextResponse.json(
            { error: 'Failed to fetch article' },
            { status: 500 }
        )
    }
}

// PUT /api/articles/[id]
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

        // Get current article to check for existing images
        const currentArticle = await prisma.article.findUnique({
            where: { id: params.id },
            select: { image: true, gallery_images: true }
        })

        // Handle image upload if new image provided
        if (image && image.size > 0) {
            // Delete old main image if exists
            if (currentArticle?.image) {
                await deleteStoredFile(currentArticle.image)
            }
            imageUrl = await uploadFile(image, image.name)
        }

        // Handle gallery images
        let galleryImages: string[] | undefined = undefined
        const existingGalleryJson = formData.get('existing_gallery_images') as string | null
        const existingGallery = existingGalleryJson ? JSON.parse(existingGalleryJson) : []

        const galleryFiles = formData.getAll('gallery_images') as File[]
        const newGalleryImages: string[] = []

        for (const file of galleryFiles) {
            if (file && file.size > 0) {
                newGalleryImages.push(await uploadFile(file, file.name))
            }
        }

        // Combine existing and new gallery images
        if (existingGalleryJson !== null || newGalleryImages.length > 0) {
            galleryImages = [...existingGallery, ...newGalleryImages]
        }

        const data: any = {
            title: formData.get('title') as string,
            slug: formData.get('slug') as string,
            short_description: formData.get('short_description') as string || null,
            content: formData.get('content') as string || null,
            category_id: formData.get('category_id') as string,
            published_date: formData.get('published_date')
                ? new Date(formData.get('published_date') as string)
                : null,
            status: formData.get('status') as 'DRAFT' | 'PUBLISHED',
            meta_title: formData.get('meta_title') as string || null,
            meta_description: formData.get('meta_description') as string || null,
        }

        if (imageUrl !== undefined) {
            data.image = imageUrl
        }

        if (galleryImages !== undefined) {
            data.gallery_images = galleryImages
        }

        // Check if slug already exists (excluding current article)
        const existingArticle = await prisma.article.findUnique({
            where: { slug: data.slug },
        })

        if (existingArticle && existingArticle.id !== params.id) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 400 }
            )
        }

        const article = await prisma.article.update({
            where: { id: params.id },
            data,
            include: {
                category: true,
            },
        })

        return NextResponse.json(article)
    } catch (error) {
        console.error('Error updating article:', error)
        return NextResponse.json(
            { error: 'Failed to update article' },
            { status: 500 }
        )
    }
}

// DELETE /api/articles/[id]
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

        // Get article to find associated blobs
        const article = await prisma.article.findUnique({
            where: { id: params.id },
            select: { image: true, gallery_images: true }
        })

        // Delete stored files if they exist
        if (article) {
            await deleteStoredFile(article.image)
            if (article.gallery_images && Array.isArray(article.gallery_images)) {
                for (const galleryImage of article.gallery_images) {
                    await deleteStoredFile(galleryImage as string)
                }
            }
        }

        await prisma.article.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting article:', error)
        return NextResponse.json(
            { error: 'Failed to delete article' },
            { status: 500 }
        )
    }
}
