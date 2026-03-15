import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { surveyUpdateSchema } from "@/lib/validations/survey"

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const body = await req.json()
    const parsed = surveyUpdateSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid data", details: parsed.error.flatten().fieldErrors },
            { status: 400 }
        )
    }

    const survey = await prisma.survey.findUnique({ where: { id } })
    if (!survey) {
        return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const updated = await prisma.survey.update({
        where: { id },
        data: { rating: parsed.data.rating },
    })

    return NextResponse.json(updated)
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const survey = await prisma.survey.findUnique({ where: { id } })
    if (!survey) {
        return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    await prisma.survey.delete({ where: { id } })

    return NextResponse.json({ success: true })
}
