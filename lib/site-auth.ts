import { SignJWT, jwtVerify } from 'jose'

const COOKIE_NAME = 'microsite2-access-token'
const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

export { COOKIE_NAME }

export async function createSiteToken(payload: { sub: string; username: string }) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(SECRET)
}

export async function verifySiteToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET)
        return payload as { sub: string; username: string }
    } catch {
        return null
    }
}
