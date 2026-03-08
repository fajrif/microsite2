import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import { ShinyButton } from "@/components/ui/shiny-button"

interface HeroSectionAppProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    badge?: {
        label: string
        text: string
    }
    subtitle?: {
        regular: string
        gradient: string
    }
    description?: string
    ctaText?: string
    ctaHref?: string
    bottomImage?: {
        light: string
        dark: string
    }
    gridOptions?: {
        angle?: number
        cellSize?: number
        opacity?: number
        lightLineColor?: string
        darkLineColor?: string
    }
}

const RetroGrid = ({
    angle = 65,
    cellSize = 60,
    opacity = 0.5,
    lightLineColor = "gray",
    darkLineColor = "gray",
}) => {
    const gridStyles = {
        "--grid-angle": `${angle}deg`,
        "--cell-size": `${cellSize}px`,
        "--opacity": opacity,
        "--light-line": lightLineColor,
        "--dark-line": darkLineColor,
    } as React.CSSProperties

    return (
        <div
            className={cn(
                "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
                `opacity-[var(--opacity)]`,
            )}
            style={gridStyles}
        >
            <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
                <div className="animate-grid [background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent to-90%" />
        </div>
    )
}

const HeroSectionApp = React.forwardRef<HTMLDivElement, HeroSectionAppProps>(
    (
        {
            className,
            title = "Build products for everyone",
            badge = {
                label: "ENTERPRISE",
                text: "Custom App"
            },
            subtitle = {
                regular: "Designing your projects faster with ",
                gradient: "the largest figma UI kit.",
            },
            description = "Sed ut perspiciatis unde omnis iste natus voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae.",
            ctaText = "Browse courses",
            ctaHref = "#",
            bottomImage = {
                light: "https://farmui.vercel.app/dashboard-light.png",
                dark: "https://farmui.vercel.app/dashboard.png",
            },
            gridOptions,
            ...props
        },
        ref,
    ) => {
        return (
            <div className={cn("relative", className)} ref={ref} {...props}>
                <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                <section className="relative max-w-full mx-auto z-1">
                    <RetroGrid {...gridOptions} />
                    <div className="max-w-screen-xl z-10 mx-auto px-4 pt-28 gap-12 md:px-8">
                        <div className="space-y-5 max-w-3xl leading-0 lg:leading-5 mx-auto text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm mb-6">
                                <span className="text-[10px] font-light uppercase tracking-[0.08em] text-white/70">
                                    {badge.label}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-white/40" />
                                <span className="text-xs font-light tracking-tight text-white/80">
                                    {badge.text}
                                </span>
                            </div>
                            <h2 className="text-2xl tracking-tighter bg-clip-text text-transparent mx-auto md:text-5xl bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] uppercase">
                                {subtitle.regular}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-orange-200">
                                    {subtitle.gradient}
                                </span>
                            </h2>
                            <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-300 leading-relaxed">
                                {description}
                            </p>
                            <div className="items-center justify-center gap-x-3 space-y-3 sm:flex sm:space-y-0">
                                <ShinyButton
                                    href="/contact"
                                    className="text-white hover:text-white rounded-2xl text-sm py-3"
                                    style={{
                                        '--shiny-cta-bg-subtle': 'rgba(192, 132, 252, 0.2)',
                                        '--shiny-cta-highlight': '#c084fc',
                                        '--shiny-cta-highlight-subtle': '#a855f7'
                                    } as React.CSSProperties}
                                >
                                    {ctaText}
                                </ShinyButton>
                            </div>
                        </div>
                        {bottomImage && (
                            <div className="mt-8 md:mt-32 md:mx-10 relative z-10">
                                <Image
                                    src="/images/sample-app-dark-id.png"
                                    alt="Application preview"
                                    width={1200}
                                    height={800}
                                    className="w-full h-auto shadow-lg rounded-lg border border-[rgba(1,120,172,0.4)]"
                                    priority={false}
                                />
                            </div>
                        )}
                    </div>
                </section>
            </div>
        )
    },
)
HeroSectionApp.displayName = "HeroSectionApp"

export { HeroSectionApp }
