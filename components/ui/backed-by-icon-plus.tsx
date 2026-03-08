'use client'

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export const BackedByICONPlus = () => {
    const hostRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            const el = hostRef.current
            if (!el) return
            const r = el.getBoundingClientRect()
            el.style.setProperty("--mx", `${e.clientX - r.left}px`)
            el.style.setProperty("--my", `${e.clientY - r.top}px`)
        }
        window.addEventListener("mousemove", onMove, { passive: true })
        return () => window.removeEventListener("mousemove", onMove)
    }, [])

    return (
        <div className="w-full py-4">
            <div
                ref={hostRef}
                className={cn(
                    "relative inline-flex items-center justify-center rounded-full",
                    "px-2 py-2 isolate select-none"
                )}
                style={
                    {
                        ["--mx" as any]: "50%",
                        ["--my" as any]: "50%",
                    } as React.CSSProperties
                }
            >
                {/* Subtle moving yellow glow */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full"
                >
                    <div
                        className={cn(
                            "absolute inset-0 rounded-full",
                            "bg-[radial-gradient(160px_80px_at_var(--mx)_var(--my),rgba(255,245,72,0.24),transparent_70%)]",
                            "blur-2xl"
                        )}
                    />
                </div>

                {/* Glass pill */}
                <div
                    className={cn(
                        "relative z-10 rounded-full px-4 py-2",
                        "backdrop-blur-xl",
                        "bg-white/15",
                        "ring-1 ring-black/5 dark:ring-white/10",
                        "shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <span
                            className={cn(
                                "h-6 w-6 shrink-0 rounded-md grid place-items-center",
                                "bg-[#fff548]",
                                "shadow-[0_2px_10px_rgba(255,245,72,0.55)]"
                            )}
                            aria-hidden="true"
                        >
                            <ICONPlusMonogram className="h-4 w-4 text-black" />
                        </span>
                        <a href="https://plniconplus.co.id/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm md:text-base font-medium tracking-wide hover:opacity-70 transition-opacity"
                        >
                            PLN Icon Plus
                        </a>
                    </div>
                </div>
            </div>
        </div >
    )
}

function ICONPlusMonogram(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <path
                d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                fill="currentColor"
            />
        </svg>
    )
}
