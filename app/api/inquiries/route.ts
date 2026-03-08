import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

// Simple in-memory rate limiter: max 3 requests per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
    const now = Date.now()
    const window = 10 * 60 * 1000 // 10 minutes
    const limit = 3

    const entry = rateLimitMap.get(ip)
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + window })
        return false
    }
    if (entry.count >= limit) return true
    entry.count++
    return false
}

export async function POST(req: NextRequest) {
    try {
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip") ??
            "unknown"

        // Rate limit check
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            )
        }

        const body = await req.json()
        const { name, email, company, message, honeypot } = body

        // Honeypot check — bots fill this hidden field
        if (honeypot) {
            return NextResponse.json({ success: true }) // Silently reject
        }

        // Server-side validation
        if (!name || typeof name !== "string" || name.trim().length < 2) {
            return NextResponse.json({ error: "Name is required (min 2 characters)." }, { status: 400 })
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "A valid email address is required." }, { status: 400 })
        }
        if (!message || typeof message !== "string" || message.trim().length < 10) {
            return NextResponse.json({ error: "Message is required (min 10 characters)." }, { status: 400 })
        }

        // Save to database
        const inquiry = await prisma.inquiry.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                company: company?.trim() || null,
                message: message.trim(),
                ip,
            },
        })

        // Send email notification (non-blocking — don't fail the request if email fails)
        const contactEmail = process.env.CONTACT_EMAIL ?? "admin@spotify-adv.com"
        if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY)
            try {
                await resend.emails.send({
                    from: "Spotify Advertising Form <onboarding@resend.dev>",
                    to: contactEmail,
                    subject: `New Inquiry from ${name.trim()}`,
                    html: `
            <h2>New Contact Inquiry</h2>
            <table style="border-collapse:collapse;width:100%">
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #eee">${name.trim()}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #eee"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Company</td><td style="padding:8px;border:1px solid #eee">${company?.trim() || "—"}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Message</td><td style="padding:8px;border:1px solid #eee;white-space:pre-wrap">${message.trim()}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Submitted</td><td style="padding:8px;border:1px solid #eee">${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</td></tr>
            </table>
          `,
                })
            } catch (emailErr) {
                console.error("Email send failed (inquiry still saved):", emailErr)
            }
        }

        return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 })
    } catch (err) {
        console.error("Inquiry submission error:", err)
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
    }
}
