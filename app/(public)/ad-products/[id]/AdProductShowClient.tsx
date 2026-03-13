'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdProductSidebar } from '@/components/AdProductSidebar'
import { AnimatedDiv } from "@/components/ui/animated-div"

interface Feature {
    id: string
    name: string
    image: string
    video_link: string | null
    audio_link: string | null
    caption: string | null
    description: string | null
}

interface AdProduct {
    id: string
    slug: string
    name: string
    tagline: string
    description: string | null
    features: Feature[]
}

interface AdProductWithFeatures {
    id: string
    name: string
    slug: string
    features: { id: string; name: string }[]
}

interface AdProductShowClientProps {
    adProduct: AdProduct
    allAdProducts: AdProductWithFeatures[]
}

function FeaturePlayer({ feature }: { feature: Feature }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isBuffering, setIsBuffering] = useState(false)
    const [progress, setProgress] = useState(0)
    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    const hasVideo = !!feature.video_link
    const hasAudio = !hasVideo && !!feature.audio_link

    const handleWaiting = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)

    const togglePlay = () => {
        if (hasVideo && videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        } else if (hasAudio && audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleTimeUpdate = () => {
        const el = hasVideo ? videoRef.current : audioRef.current
        if (!el) return
        const pct = (el.currentTime / el.duration) * 100
        setProgress(pct || 0)
    }

    const handleEnded = () => {
        setIsPlaying(false)
        setIsBuffering(false)
        setProgress(0)
    }

    return (
        <div className="w-[220px] h-[460px] shrink-0 rounded-2xl border-2 bg-black overflow-hidden flex flex-col" style={{ borderColor: 'hsl(var(--ptr-primary))' }}>
            {hasVideo ? (
                /* VIDEO: full-height with centered play overlay */
                <div className="relative w-full h-full">
                    <video
                        ref={videoRef}
                        src={feature.video_link!}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleEnded}
                        onWaiting={handleWaiting}
                        onPlaying={handleCanPlay}
                        onCanPlay={handleCanPlay}
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Poster image overlay — visible when not playing */}
                    {!isPlaying && (
                        <Image
                            src={feature.image}
                            alt={feature.name}
                            fill
                            className="absolute inset-0 object-cover z-[5]"
                            unoptimized
                        />
                    )}
                    {/* Centered play/pause overlay */}
                    <button
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center z-10 group"
                    >
                        <div className={cn(
                            'w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300',
                            isBuffering && isPlaying
                                ? 'opacity-100'
                                : isPlaying
                                    ? 'opacity-0 group-hover:opacity-100'
                                    : 'opacity-100'
                        )}>
                            {isBuffering && isPlaying ? (
                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                            ) : isPlaying ? (
                                <Pause className="h-6 w-6 text-white" />
                            ) : (
                                <Play className="h-6 w-6 text-white ml-0.5" />
                            )}
                        </div>
                    </button>
                </div>
            ) : hasAudio ? (
                /* AUDIO: image + bottom player controls */
                <>
                    <div className="flex-1 flex items-center justify-center overflow-hidden p-3 pt-4">
                        <div className="relative w-full" style={{ aspectRatio: '4/5' }}>
                            <Image
                                src={feature.image}
                                alt={feature.name}
                                fill
                                className="object-contain rounded-sm"
                                unoptimized
                            />
                        </div>
                    </div>

                    <audio
                        ref={audioRef}
                        src={feature.audio_link!}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleEnded}
                        onWaiting={handleWaiting}
                        onPlaying={handleCanPlay}
                        onCanPlay={handleCanPlay}
                    />

                    <div className="shrink-0 px-4 pb-4 pt-3">
                        {/* Progress bar */}
                        <div className={cn(
                            "w-full h-[3px] bg-white/20 rounded-full mb-4",
                            isBuffering && isPlaying && "animate-pulse"
                        )}>
                            <div
                                className="h-full rounded-full transition-all duration-100"
                                style={{ width: `${progress}%`, backgroundColor: 'hsl(var(--ptr-primary))' }}
                            />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-6">
                            <button className="text-white/40 hover:text-white transition-colors">
                                <SkipBack className="h-4 w-4" />
                            </button>
                            <button
                                onClick={togglePlay}
                                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                            >
                                {isBuffering && isPlaying ? (
                                    <Loader2 className="h-4 w-4 text-black animate-spin" />
                                ) : isPlaying ? (
                                    <Pause className="h-4 w-4 text-black" />
                                ) : (
                                    <Play className="h-4 w-4 text-black ml-0.5" />
                                )}
                            </button>
                            <button className="text-white/40 hover:text-white transition-colors">
                                <SkipForward className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                /* IMAGE ONLY: no media controls */
                <div className="flex-1 flex items-center justify-center overflow-hidden p-3 pt-4">
                    <div className="relative w-full" style={{ aspectRatio: '4/5' }}>
                        <Image
                            src={feature.image}
                            alt={feature.name}
                            fill
                            className="object-contain rounded-sm"
                            unoptimized
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export function AdProductShowClient({ adProduct, allAdProducts }: AdProductShowClientProps) {
    return (
        <>
            <div className="absolute top-0 z-[0] h-screen w-screen pointer-events-none bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(16,48,39,0.8),rgba(255,255,255,0))]" />
            <section className="min-h-screen bg-primary text-white">
                {/* Spacer for fixed nav */}
                <div className="h-20" />

                <div className="container mx-auto px-4 py-8 md:py-16">
                    <div className="flex gap-10 lg:gap-16">
                        {/* Left: Tree navigation (desktop only) */}
                        <AdProductSidebar
                            adProducts={allAdProducts}
                            currentAdProductSlug={adProduct.slug}
                        />

                        {/* Right: Main content */}
                        <div className="flex-1 min-w-0">
                            <div className="max-w-3xl">
                                {/* Tagline */}
                                <AnimatedDiv id="ad-product-tagline" delay={0}>
                                    <h1 className="drop-shadow-sm font-display text-3xl md:text-4xl lg:text-6xl font-bold leading-none text-[hsl(var(--ptr-primary))]">
                                        {adProduct.tagline}
                                    </h1>
                                </AnimatedDiv>

                                {/* Description */}
                                {adProduct.description && (
                                    <AnimatedDiv id="ad-product-description" delay={0.1}>
                                        <p className="mt-6 text-sm md:text-base font-light text-white leading-relaxed max-w-2xl">
                                            {adProduct.description}
                                        </p>
                                    </AnimatedDiv>
                                )}
                            </div>

                            {/* Features in zig-zag layout */}
                            <div className="max-w-2xl mt-12 md:mt-20 space-y-16 md:space-y-24">
                                {adProduct.features.map((feature, index) => {
                                    const isEven = index % 2 === 0

                                    return (
                                        <AnimatedDiv
                                            key={feature.id}
                                            id={`feature-${feature.id}`}
                                            delay={0.1 + index * 0.1}
                                        >
                                            <div className={cn(
                                                "flex flex-col items-center gap-8 md:gap-12",
                                                isEven ? "md:flex-row" : "md:flex-row-reverse"
                                            )}>
                                                {/* Player */}
                                                <div className="shrink-0">
                                                    <FeaturePlayer feature={feature} />
                                                </div>

                                                {/* Caption + Description */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl md:text-2xl font-bold text-[hsl(var(--ptr-primary))] font-display mb-4">
                                                        {feature.caption}
                                                    </h3>
                                                    {feature.description && (
                                                        <div
                                                            className="text-sm md:text-base font-light text-white leading-relaxed prose prose-invert max-w-none prose-p:text-white prose-p:font-light"
                                                            dangerouslySetInnerHTML={{ __html: feature.description }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </AnimatedDiv>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
