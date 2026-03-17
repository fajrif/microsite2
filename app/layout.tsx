import type React from "react"
import type { Metadata } from "next"
import { Inter, Noto_Sans } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' })

const notoSans = Noto_Sans({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    style: ["normal", "italic"],
    variable: '--font-noto-sans',
})

const spotifyMixWide = localFont({
    src: [
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-Regular.woff', weight: '400', style: 'normal' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-Black.woff', weight: '900', style: 'normal' },
    ],
    variable: '--font-spotify-mix-wide',
    display: 'swap',
})

export const metadata: Metadata = {
    title: "Spotify 广告",
    description: "将Spotify的创意转化为成功案例：互动式演示",
    metadataBase: new URL("https://micrositedemotwo.com"),
    openGraph: {
        title: "Spotify 广告",
        description: "将Spotify的创意转化为成功案例：互动式演示",
        url: "https://micrositedemotwo.com",
        siteName: "Spotify 广告",
        images: [
            {
                url: "https://micrositedemotwo.com/images/og-image.png",
                width: 1200,
                height: 261,
                alt: "Spotify Advertising",
                type: "image/png",
            },
        ],
        locale: "id_ID",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Spotify 广告",
        description: "将Spotify的创意转化为成功案例：互动式演示",
        images: ["https://micrositedemotwo.com/images/og-image.png"],
    },
    icons: {
        icon: [
            {
                url: "/icon.png",
            },
        ],
        apple: "/apple-icon.png",
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${notoSans.variable} ${spotifyMixWide.variable}`}>
            <body className="antialiased">
                {children}
                {process.env.VERCEL && <Analytics />}
            </body>
        </html>
    )
}
