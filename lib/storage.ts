/**
 * Storage layer — saves all uploads to public/uploads on the local filesystem.
 */

import fs from 'fs/promises'
import path from 'path'

export async function uploadFile(file: File, filename: string): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const localName = `${Date.now()}-${filename}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadDir, { recursive: true })
  await fs.writeFile(path.join(uploadDir, localName), buffer)
  return `/uploads/${localName}`
}

export async function deleteFile(url: string): Promise<void> {
  if (!url.startsWith('/uploads/')) return
  const filePath = path.join(process.cwd(), 'public', url)
  try {
    await fs.unlink(filePath)
  } catch {
    // File may already be gone — ignore
  }
}
