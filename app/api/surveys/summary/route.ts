import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adProducts = await prisma.adProduct.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            surveys: {
                select: { rating: true },
            },
        },
        orderBy: { orderNo: "asc" },
    })

    const summary = adProducts.map((p) => {
        const count = p.surveys.length
        const avg =
            count > 0
                ? p.surveys.reduce((sum, s) => sum + s.rating, 0) / count
                : 0
        return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            totalSurveys: count,
            averageRating: Math.round(avg * 100) / 100,
        }
    })

    return NextResponse.json({ summary })
}
