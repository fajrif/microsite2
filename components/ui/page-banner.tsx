'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import SplitType from 'split-type'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { ShinyButton } from './shiny-button'

gsap.registerPlugin(useGSAP)

interface BreadcrumbItem {
    label: string
    href?: string
}

interface PageBannerProps {
    title: string
    description?: string
    breadcrumbs?: BreadcrumbItem[]
    badge?: {
        label: string
        text: string
    }
    /** Optional background image URL */
    image?: string
    /** Alt text for the background image */
    imageAlt?: string
    /** Optional custom background component */
    backgroundComponent?: React.ReactNode
    /** CTA buttons */
    ctaButtons?: Array<{
        text: string
        href: string
        primary?: boolean
        hideOnMobile?: boolean
    }>
    /** Micro details list */
    microDetails?: Array<string>
    hideMicroDetailsOnMobile?: boolean
    className?: string
    animate?: boolean
}

export function PageBanner({
    title,
    description,
    breadcrumbs = [],
    badge,
    image,
    imageAlt = 'Banner image',
    backgroundComponent,
    ctaButtons = [],
    microDetails = [],
    hideMicroDetailsOnMobile = false,
    className = 'pb-16',
    animate = true,
}: PageBannerProps) {
    const sectionRef = useRef<HTMLDivElement | null>(null)
    const headerRef = useRef<HTMLHeadingElement | null>(null)
    const descRef = useRef<HTMLParagraphElement | null>(null)
    const badgeRef = useRef<HTMLDivElement | null>(null)
    const breadcrumbRef = useRef<HTMLDivElement | null>(null)
    const ctaRef = useRef<HTMLDivElement | null>(null)
    const microRef = useRef<HTMLUListElement | null>(null)

    useGSAP(
        () => {
            if (!animate || !headerRef.current) return

            document.fonts.ready.then(() => {
                const split = new SplitType(headerRef.current!, {
                    types: 'words',
                    wordClass: 'word',
                })

                gsap.set(split.words, {
                    filter: 'blur(12px)',
                    yPercent: 20,
                    autoAlpha: 0,
                    scale: 1.04,
                    transformOrigin: '50% 100%',
                })

                if (badgeRef.current) {
                    gsap.set(badgeRef.current, { autoAlpha: 0, y: -6 })
                }
                if (descRef.current) {
                    gsap.set(descRef.current, { autoAlpha: 0, y: 8 })
                }
                if (breadcrumbRef.current) {
                    gsap.set(breadcrumbRef.current, { autoAlpha: 0, y: -4 })
                }
                if (ctaRef.current) {
                    gsap.set(ctaRef.current, { autoAlpha: 0, y: 8 })
                }
                if (microRef.current) {
                    const microItems = microRef.current.querySelectorAll('li')
                    gsap.set(microItems, { autoAlpha: 0, y: 6 })
                }

                const tl = gsap.timeline({
                    defaults: { ease: 'power3.out' },
                })

                // Breadcrumb
                if (breadcrumbRef.current) {
                    tl.to(breadcrumbRef.current, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.0)
                }

                // Badge
                if (badgeRef.current) {
                    tl.to(badgeRef.current, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.1)
                }

                // Title words
                tl.to(
                    split.words,
                    {
                        filter: 'blur(0px)',
                        yPercent: 0,
                        autoAlpha: 1,
                        scale: 1,
                        duration: 0.7,
                        stagger: 0.12,
                    },
                    0.15
                )

                // Description
                if (descRef.current) {
                    tl.to(descRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.4')
                }

                // CTA buttons
                if (ctaRef.current) {
                    tl.to(ctaRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.35')
                }

                // Micro details
                if (microRef.current) {
                    const microItems = microRef.current.querySelectorAll('li')
                    tl.to(microItems, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.25')
                }
            })
        },
        { scope: sectionRef, dependencies: [animate] }
    )

    return (
        <div
            ref={sectionRef}
            className={`relative overflow-hidden ${className}`}
        >
            {/* Background Layer - Component, Image, or Gradient */}
            {backgroundComponent ? (
                <>
                    {/* Custom Background Component */}
                    <div className="absolute inset-0">
                        {backgroundComponent}
                    </div>
                    {/* Gradient Overlay for Custom Background */}
                    <div
                        aria-hidden
                        className="absolute z-[1] inset-0 bg-gradient-to-r from-primary from-35%"
                    />
                </>
            ) : image ? (
                <>
                    {/* Hero Image Background */}
                    <div className="absolute inset-0">
                        <Image
                            src={image}
                            alt={imageAlt}
                            fill
                            className="object-cover object-center"
                            priority
                        />
                    </div>
                    {/* Gradient Overlay for Image */}
                    <div
                        aria-hidden
                        className="absolute z-[1] inset-0 bg-gradient-to-r from-primary from-35%"
                    />
                </>
            ) : (
                <>
                    {/* Solid Primary Base */}
                    <div className="absolute inset-0 bg-primary" />

                    {/* Center Radial Glow — Navy → lighter → Navy */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 90%)',
                        }}
                    />
                </>
            )}

            {/* Content */}
            <div className={`relative z-10 container mx-auto pt-32 ${backgroundComponent ? 'pb-[100px] md:pb-[200px]' : ''}`}>
                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                    <div
                        ref={breadcrumbRef}
                        className="flex items-center gap-1 text-sm font-light text-white/60 mb-6"
                    >
                        <Link href="/" className="hover:text-[hsl(var(--ptr-primary))] transition-colors">
                            Home
                        </Link>
                        {breadcrumbs.map((crumb, index) => (
                            <span key={index} className="flex items-center gap-1">
                                <ChevronRight className="w-3 h-3" />
                                {crumb.href ? (
                                    <Link href={crumb.href} className="hover:text-[hsl(var(--ptr-primary))] transition-colors">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-white/80">{crumb.label}</span>
                                )}
                            </span>
                        ))}
                    </div>
                )}

                {/* Badge */}
                {badge && (
                    <div
                        ref={badgeRef}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm mb-6"
                    >
                        <span className="text-[10px] font-light uppercase tracking-[0.08em] text-white/70">
                            {badge.label}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-white/40" />
                        <span className="text-xs font-light tracking-tight text-white/80">
                            {badge.text}
                        </span>
                    </div>
                )}

                {/* Title */}
                <h2
                    ref={headerRef}
                    className="text-3xl font-light uppercase tracking-wide text-white md:text-4xl">
                    {title}
                </h2>

                {/* Description */}
                {description && (
                    <p
                        ref={descRef}
                        className="mt-6 max-w-2xl text-base font-light leading-relaxed text-white/80 sm:text-lg"
                    >
                        {description}
                    </p>
                )}

                {/* CTA Buttons */}
                {ctaButtons.length > 0 && (
                    <div ref={ctaRef} className="flex flex-wrap items-center gap-3 mt-8">
                        {ctaButtons.map((button, index) => (
                            button.primary ? (
                                <ShinyButton
                                    key={index}
                                    href={button.href}
                                    className={`text-white rounded-2xl text-sm py-3 ${button.hideOnMobile ? 'hidden md:inline-flex' : ''}`}
                                >
                                    {button.text}
                                </ShinyButton>
                            ) : (
                                <a
                                    key={index}
                                    href={button.href}
                                    className={`rounded-2xl border border-white/10 px-5 py-3 text-sm font-light tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 duration-300 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 ${button.hideOnMobile ? 'hidden md:inline-flex' : ''}`}
                                >
                                    {button.text}
                                </a>
                            )
                        ))}
                    </div>
                )}

                {/* Micro Details */}
                {microDetails.length > 0 && (
                    <ul
                        ref={microRef}
                        className={`mt-8 flex flex-wrap gap-6 text-xs font-extralight tracking-tight text-white ${hideMicroDetailsOnMobile ? 'hidden md:flex' : ''}`}
                    >
                        {microDetails.map((detail, index) => (
                            <li key={index} className="flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-white/40" /> {detail}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
