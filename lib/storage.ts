/**
 * Storage layer — Alibaba OSS in production, local filesystem in development.
 */

import path from 'path'
import fs from 'fs/promises'

let ossClient: any = null

function getOssClient() {
  if (ossClient) return ossClient
  if (!process.env.OSS_ACCESS_KEY_ID) return null

  const OSS = require('ali-oss')
  ossClient = new OSS({
    region: process.env.OSS_REGION || 'oss-ap-southeast-5',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
    bucket: process.env.OSS_BUCKET!,
    timeout: 300_000, // 5 minutes
  })
  return ossClient
}

function getOssUrl(objectKey: string): string {
  if (process.env.OSS_CDN_DOMAIN) {
    const cdnDomain = process.env.OSS_CDN_DOMAIN.replace(/\/$/, '')
    return `${cdnDomain}/${objectKey}`
  }
  const bucket = process.env.OSS_BUCKET!
  const region = process.env.OSS_REGION || 'oss-ap-southeast-5'
  return `https://${bucket}.${region}.aliyuncs.com/${objectKey}`
}

export async function uploadFile(file: File, filename?: string): Promise<string> {
  const name = filename ?? file.name
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Priority 1: Alibaba Cloud OSS
  const oss = getOssClient()
  if (oss) {
    const objectKey = `uploads/${Date.now()}-${name}`
    await oss.put(objectKey, buffer)
    return getOssUrl(objectKey)
  }

  // Priority 2: Local fallback (dev only)
  const localName = `${Date.now()}-${name}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadDir, { recursive: true })
  await fs.writeFile(path.join(uploadDir, localName), buffer)
  return `/uploads/${localName}`
}

function isOssUrl(url: string): boolean {
  const cdnDomain = process.env.OSS_CDN_DOMAIN
  if (cdnDomain && url.startsWith(cdnDomain.replace(/\/$/, ''))) return true
  return /\.oss-[^.]+\.aliyuncs\.com/.test(url)
}

function extractOssKey(url: string): string {
  const cdnDomain = process.env.OSS_CDN_DOMAIN
  if (cdnDomain) {
    const prefix = cdnDomain.replace(/\/$/, '')
    if (url.startsWith(prefix)) {
      return url.slice(prefix.length + 1) // +1 for the /
    }
  }
  // Direct OSS URL: https://bucket.region.aliyuncs.com/key
  try {
    const parsed = new URL(url)
    return parsed.pathname.slice(1) // remove leading /
  } catch {
    return url
  }
}

export async function deleteFile(url: string | null | undefined): Promise<void> {
  if (!url) return

  if (isOssUrl(url)) {
    const oss = getOssClient()
    if (oss) {
      const key = extractOssKey(url)
      try { await oss.delete(key) } catch { /* ignore */ }
    }
  } else if (url.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), 'public', url)
    try { await fs.unlink(filePath) } catch { /* ignore */ }
  }
}
