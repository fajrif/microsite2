'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AnimatedDiv } from "@/components/ui/animated-div"
import { ShinyButton } from '@/components/ui/shiny-button'

interface AdProduct {
    id: string
    name: string
    slug: string
    image: string
    tagline: string
    description: string | null
    features: Array<{
        id: string
        name: string
    }>
}

interface HomeClientProps {
    adProducts: AdProduct[]
}

export function HomeClient({ adProducts }: HomeClientProps) {
    const router = useRouter()

    return (
        <>
            <div className="absolute top-0 z-[0] h-screen w-screen bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(16,48,39,0.8),rgba(255,255,255,0))]" />
            <section className="min-h-screen bg-primary text-white">
                <div className="container mx-auto py-12 md:py-20 px-4">
                    {/* Logo */}
                    <AnimatedDiv id="home-logo" delay={0}>
                        <div className="flex justify-center mb-8">
                            <Image
                                src="/images/logo.png"
                                alt="Spotify Advertising"
                                width={200}
                                height={56}
                                className="w-40 md:w-48 h-auto"
                                unoptimized
                                priority
                            />
                        </div>
                    </AnimatedDiv>

                    {/* Headline */}
                    <AnimatedDiv id="home-headline" delay={0.05}>
                        <h1 className="drop-shadow-sm font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-none text-[hsl(var(--ptr-primary))] text-center">
                            Explore Our Ad Products:
                        </h1>
                    </AnimatedDiv>
                    <AnimatedDiv id="home-subtitle" delay={0.1}>
                        <p className="mt-2 text-2xl md:text-4xl lg:text-5xl font-light text-[hsl(var(--ptr-primary))] text-center">
                            An interactive walk-through.
                        </p>
                    </AnimatedDiv>

                    {/* Subtitle */}
                    <AnimatedDiv id="home-description" delay={0.2}>
                        <p className="mt-6 text-base md:text-lg text-white max-w-3xl mx-auto leading-relaxed text-center">
                            Grab your headphones & let&apos;s get started.
                        </p>
                    </AnimatedDiv>

                    {/* CTA Button */}
                    <AnimatedDiv id="home-cta" delay={0.3}>
                        <div className="flex justify-center mt-8">
                            <ShinyButton
                                href={adProducts.length > 0 ? `/ad-products/${adProducts[0].slug}` : '#'}
                                className="text-white rounded-4xl text-base py-3"
                            >
                                Let&apos;s start!
                            </ShinyButton>
                        </div>
                    </AnimatedDiv>

                    {/* iPhone Mockups */}
                    <AnimatedDiv id="home-phones" delay={0.5}>
                        <div className="mt-0 md:mt-16 flex justify-center items-end gap-[-20px]">
                            <div className="flex items-end justify-center relative" style={{ height: 420 }}>
                                {adProducts.map((product, index) => {
                                    const total = adProducts.length
                                    const centerIdx = Math.floor(total / 2)
                                    const offset = index - centerIdx

                                    // Stagger: center phone is tallest/highest
                                    const translateY = Math.abs(offset) * 24
                                    const zIndex = total - Math.abs(offset)
                                    const rotate = offset * 4
                                    const marginLeft = index === 0 ? 0 : -28

                                    return (
                                        <button
                                            key={product.id}
                                            onClick={() => router.push(`/ad-products/${product.slug}`)}
                                            className="group relative shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105"
                                            style={{
                                                zIndex,
                                                transform: `translateY(${translateY}px) rotate(${rotate}deg)`,
                                                marginLeft: index > 0 ? marginLeft : 0,
                                            }}
                                        >
                                            {/* iPhone frame */}
                                            <div className={cn(
                                                'w-[160px] h-[320px] md:w-[200px] md:h-[400px] rounded-[28px] md:rounded-[32px] overflow-hidden',
                                                'border-[3px] border-gray-700 bg-black shadow-2xl',
                                                'transition-all duration-300',
                                                'group-hover:border-[hsl(var(--ptr-primary))] group-hover:shadow-[0_0_30px_rgba(30,215,96,0.3)]'
                                            )}>
                                                {/* Notch */}
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 md:w-24 h-5 md:h-6 bg-black rounded-b-2xl z-10" />

                                                {/* Screen content */}
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                            </div>

                                            {/* Product name below phone */}
                                            <p className={cn(
                                                'mt-3 text-sm md:text-base font-spotify font-[900] text-center transition-colors duration-300',
                                                'text-white group-hover:text-[hsl(var(--ptr-primary))]'
                                            )}>
                                                {product.name}
                                            </p>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </AnimatedDiv>
                </div>
            </section>
        </>
    )
}
