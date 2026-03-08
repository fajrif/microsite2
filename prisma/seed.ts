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
