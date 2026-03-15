import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { surveySubmitSchema } from "@/lib/validations/survey"

// Rate limiter: max 5 survey submissions per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
    const now = Date.now()
    const window = 10 * 60 * 1000 // 10 minutes
    const limit = 5

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

        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            )
        }

        const body = await req.json()
        const parsed = surveySubmitSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid data", details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        // Verify ad_product exists
        const adProduct = await prisma.adProduct.findUnique({
            where: { id: parsed.data.ad_product_id },
        })
        if (!adProduct) {
            return NextResponse.json({ error: "Ad product not found" }, { status: 404 })
        }

        const survey = await prisma.survey.create({
            data: {
                ad_product_id: parsed.data.ad_product_id,
                rating: parsed.data.rating,
                ip,
            },
        })

        return NextResponse.json({ success: true, id: survey.id }, { status: 201 })
    } catch (err) {
        console.error("Survey submission error:", err)
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const ad_product_id = searchParams.get("ad_product_id")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where = ad_product_id ? { ad_product_id } : {}

    const [surveys, total] = await Promise.all([
        prisma.survey.findMany({
            where,
            include: { ad_product: { select: { id: true, name: true } } },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.survey.count({ where }),
    ])

    return NextResponse.json({
        surveys,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    })
}
