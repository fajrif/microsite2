import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required')
                }

                const admin = await prisma.admin.findUnique({
                    where: { email: credentials.email },
                })

                if (!admin) {
                    throw new Error('Invalid email or password')
                }

                const passwordMatch = await bcrypt.compare(
                    credentials.password,
                    admin.password_hash
                )

                if (!passwordMatch) {
                    throw new Error('Invalid email or password')
                }

                return {
                    id: admin.id,
                    email: admin.email,
                    name: admin.full_name,
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/admin/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.email = user.email
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.email = token.email as string
            }
            return session
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
}
