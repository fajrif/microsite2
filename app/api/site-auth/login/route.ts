import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSiteToken, COOKIE_NAME } from '@/lib/site-auth'
import { userLoginSchema } from '@/lib/validations/user'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { username, password } = userLoginSchema.parse(body)

        const user = await prisma.user.findUnique({
            where: { username },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            )
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash)
        if (!passwordMatch) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            )
        }

        const token = await createSiteToken({ sub: user.id, username: user.username })

        const response = NextResponse.json({ success: true })
        response.cookies.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        })

        return response
    } catch (error) {
        console.error('Site login error:', error)
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        )
    }
}
