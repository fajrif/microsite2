import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if the path is under /admin
    if (pathname.startsWith('/admin')) {
        // Allow access to login page without authentication
        if (pathname === '/admin/login') {
            const token = await getToken({
                req: request,
                secret: process.env.NEXTAUTH_SECRET,
            })

            // If already logged in, redirect to dashboard
            if (token) {
                return NextResponse.redirect(new URL('/admin', request.url))
            }

            return NextResponse.next()
        }

        // For all other /admin routes, check authentication
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        })

        if (!token) {
            // Redirect to login if not authenticated
            const loginUrl = new URL('/admin/login', request.url)
            loginUrl.searchParams.set('from', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
