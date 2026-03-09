import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Layers, Music } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/admin/login')
    }

    // Get statistics
    const [adProductCount, featuresCount] = await Promise.all([
        prisma.adProduct.count(),
        prisma.feature.count(),
    ])

    const dashboardStat = [
        {
            key: 1,
            title: "Total AdProduct",
            value: adProductCount,
            icon: Layers,
            color: "text-blue-600",
        },
        {
            key: 2,
            title: "Total Features",
            value: featuresCount,
            icon: Music,
            color: "text-green-600",
        },
    ]

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back, {session.user.name}! Here's what's happening on your site today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardStat.map((stat) => (
                    <Card key={stat.key}>
                        <CardContent className="py-3 px-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Start Guide
                </h2>
                <div className="space-y-3 text-sm text-gray-600">
                    <p>• Use the sidebar to navigate between different sections</p>
                    <p>• Manage admin users in the Admins section</p>
                    <p>• Create and publish showcases in the Showcases section</p>
                    <p>• Organize content using Classifications</p>
                    <p>• Click "Change Password" in the top bar to update your profile</p>
                </div>
            </div>
        </div>
    )
}
