import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadFile } from '@/lib/storage'

// Allow up to 5 minutes for large file uploads
export const maxDuration = 300

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file || file.size === 0) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const url = await uploadFile(file, file.name)
        return NextResponse.json({ url })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('Error uploading file:', message, error)
        return NextResponse.json(
            { error: `Failed to upload file: ${message}` },
            { status: 500 }
        )
    }
}
