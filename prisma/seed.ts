import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function copyAsset(srcRelative: string, destFileName: string): string {
    const srcPath = path.join(process.cwd(), srcRelative)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
    }

    const destPath = path.join(uploadDir, destFileName)

    if (!fs.existsSync(destPath) && fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath)
    }

    return `/uploads/${destFileName}`
}

async function main() {
    console.log('🌱 Starting database seed...')

    // Create initial admin user
    const hashedPassword = await bcrypt.hash('Secret1234!', 10)

    const admin = await prisma.admin.upsert({
        where: { email: 'admin@spotify-adv.com' },
        update: {},
        create: {
            email: 'admin@spotify-adv.com',
            full_name: 'Administrator',
            password_hash: hashedPassword,
        },
    })

    console.log('✅ Created admin user:', { email: admin.email, full_name: admin.full_name })

    // Create some sample categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { name: 'Technology' },
            update: {},
            create: {
                name: 'Technology',
            },
        }),
        prisma.category.upsert({
            where: { name: 'Business' },
            update: {},
            create: {
                name: 'Business',
            },
        }),
        prisma.category.upsert({
            where: { name: 'News' },
            update: {},
            create: {
                name: 'News',
            },
        }),
    ])

    console.log('✅ Created categories:', categories.map(c => c.name).join(', '))

    // ==========================================
    // Seed Ad Products
    // ==========================================

    const audioImage = copyAsset('public/images/ad_products/audio.png', 'ad-product-audio.png')
    const videoImage = copyAsset('public/images/ad_products/video.png', 'ad-product-video.png')
    const displayImage = copyAsset('public/images/ad_products/display.png', 'ad-product-display.png')

    const audioProduct = await prisma.adProduct.upsert({
        where: { name: 'Audio' },
        update: {},
        create: {
            name: 'Audio',
            slug: 'audio',
            tagline: 'Audio Ad built for screenless moments',
            description: 'With audio ads, you can connect with fans across their everyday moments. They\'re a uniquely powerful way to build personal connections, even in screenless moments where other media can\'t reach.',
            image: audioImage,
            orderNo: 0,
        },
    })

    const videoProduct = await prisma.adProduct.upsert({
        where: { name: 'Video' },
        update: {},
        create: {
            name: 'Video',
            slug: 'video',
            tagline: 'Video Ads that command attention',
            description: 'Create moments of connection through visual storytelling, served only when your audience is viewing the app.',
            image: videoImage,
            orderNo: 1,
        },
    })

    const displayProduct = await prisma.adProduct.upsert({
        where: { name: 'Display' },
        update: {},
        create: {
            name: 'Display',
            slug: 'display',
            tagline: 'Reach and engage with Display Ads',
            description: 'Display ads open up new opportunities to connect with your audience without disrupting their listening experience.',
            image: displayImage,
            orderNo: 2,
        },
    })

    console.log('✅ Created ad products: Audio, Video, Display')

    // ==========================================
    // Seed Features
    // ==========================================

    // Audio features
    const audioAdsImage = copyAsset('public/images/features/audio/audio-ads.png', 'feature-audio-ads.png')

    await prisma.feature.upsert({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Audio Ads',
            ad_product_id: audioProduct.id,
            description: '<p>Only delivered when listeners are most receptive in a no-swipe, no-scroll environment and 93% of the brain\'s engagement with the content on Spotify is transferred directly into ad engagement.</p>',
            image: audioAdsImage,
            video_link: '/sample-video1.mp4',
            orderNo: 0,
        },
    })

    // Video features
    const inStreamImage = copyAsset('public/images/features/video/in-stream-video-ads.png', 'feature-in-stream-video-ads.png')
    const inFeedImage = copyAsset('public/images/features/video/in-feed-video-ads.png', 'feature-in-feed-video-ads.png')

    await prisma.feature.upsert({
        where: { id: '00000000-0000-0000-0000-000000000002' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000002',
            name: 'In-Stream Video Ads',
            ad_product_id: videoProduct.id,
            description: '<p>Delivered when the screen is in view and the user is actively browsing to discover new music, reading lyrics, watching podcasts, and more. The ads include a companion banner, or CTA card, with a customizable call-to-action to help drive engagement.</p>',
            image: inStreamImage,
            video_link: '/sample-video1.mp4',
            orderNo: 0,
        },
    })

    await prisma.feature.upsert({
        where: { id: '00000000-0000-0000-0000-000000000003' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000003',
            name: 'In-Feed Video Ads',
            ad_product_id: videoProduct.id,
            description: '<p>Optimized to reach listeners who are likely to view your video and be receptive to your brand message. Delivered on the Now Playing View (NPV) when the app is in view, In-Feed Video showcases your brand alongside the music that listeners have chosen to stream.</p>',
            image: inFeedImage,
            video_link: '/sample-video1.mp4',
            orderNo: 1,
        },
    })

    // Display features
    const inFeedBrowseImage = copyAsset('public/images/features/display/in-feed-display-on-browse.png', 'feature-in-feed-display-browse.png')
    const inFeedPlayerImage = copyAsset('public/images/features/display/in-feed-display-on-spotify-player.png', 'feature-in-feed-display-player.png')

    await prisma.feature.upsert({
        where: { id: '00000000-0000-0000-0000-000000000004' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000004',
            name: 'In-feed Display On Browse',
            ad_product_id: displayProduct.id,
            description: '<p>Seamlessly positioned within the discovery journey, offering a native and engaging brand presence.</p>',
            image: inFeedBrowseImage,
            video_link: '/sample-video1.mp4',
            orderNo: 0,
        },
    })

    await prisma.feature.upsert({
        where: { id: '00000000-0000-0000-0000-000000000005' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000005',
            name: 'In-feed Display On Spotify Player',
            ad_product_id: displayProduct.id,
            description: '<p>Visibly integrated into the listener\'s active music experience, delivering high-impact, non-intrusive brand moments.</p>',
            image: inFeedPlayerImage,
            video_link: '/sample-video1.mp4',
            orderNo: 1,
        },
    })

    console.log('✅ Created features for Audio, Video, and Display')

    console.log('🎉 Seed completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
