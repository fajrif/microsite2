import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { jwtVerify } from 'jose'
import { COOKIE_NAME } from '@/lib/site-auth'

async function verifySiteCookie(request: NextRequest) {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token) return null
    try {
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
        const { payload } = await jwtVerify(token, secret)
        return payload
    } catch {
        return null
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // --- Admin routes ---
    if (pathname.startsWith('/admin')) {
        if (pathname === '/admin/login') {
            const token = await getToken({
                req: request,
                secret: process.env.NEXTAUTH_SECRET,
            })
            if (token) {
                return NextResponse.redirect(new URL('/admin', request.url))
            }
            return NextResponse.next()
        }

        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        })
        if (!token) {
            const loginUrl = new URL('/admin/login', request.url)
            loginUrl.searchParams.set('from', pathname)
            return NextResponse.redirect(loginUrl)
        }
        return NextResponse.next()
    }

    // --- Public site login page ---
    if (pathname === '/login') {
        const sitePayload = await verifySiteCookie(request)
        if (sitePayload) {
            return NextResponse.redirect(new URL('/', request.url))
        }
        return NextResponse.next()
    }

    // --- Protected public routes ---
    const sitePayload = await verifySiteCookie(request)
    if (!sitePayload) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/',
        '/login',
        '/ad-products',
        '/ad-products/:path*',
    ],
}
