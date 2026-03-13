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
                        <h1 className="drop-shadow-sm font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-none text-[hsl(var(--ptr-primary))] text-center mb-2">
                            探索我们的广告产品：
                        </h1>
                    </AnimatedDiv>
                    <AnimatedDiv id="home-subtitle" delay={0.1}>
                        <h1 className="drop-shadow-sm font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-none text-[hsl(var(--ptr-primary))] text-center">
                            您的 Spotify 营销指南
                        </h1>
                    </AnimatedDiv>

                    {/* Subtitle */}
                    <AnimatedDiv id="home-description" delay={0.2}>
                        <p className="mt-6 text-xl text-white max-w-3xl mx-auto leading-relaxed text-center">
                            戴上耳机，即刻启程
                        </p>
                    </AnimatedDiv>

                    {/* CTA Button */}
                    <AnimatedDiv id="home-cta" delay={0.3}>
                        <div className="flex justify-center mt-8">
                            <ShinyButton
                                href={adProducts.length > 0 ? `/ad-products/${adProducts[0].slug}` : '#'}
                                className="text-white rounded-4xl text-base py-3"
                            >
                                马上开始！
                            </ShinyButton>
                        </div>
                    </AnimatedDiv>

                    {/* iPhone Mockups */}
                    <AnimatedDiv id="home-phones" delay={0.5}>
                        <div className="mt-0 md:mt-10 flex justify-center items-end overflow-hidden md:overflow-visible w-full">
                            <div className="flex items-center justify-center relative w-full h-[340px] md:h-[560px] lg:h-[640px]">
                                {adProducts.map((product, index) => {
                                    const total = adProducts.length
                                    const centerIdx = Math.floor(total / 2)
                                    const offset = index - centerIdx

                                    // Center phone is larger, side phones are scaled down
                                    const isCenter = offset === 0
                                    const scale = isCenter ? 1 : 0.82
                                    const zIndex = total - Math.abs(offset)
                                    // Left phone overlaps center from left, right phone overlaps from right
                                    const isLeft = offset < 0
                                    const isRight = offset > 0
                                    const overlapPx = 40

                                    return (
                                        <button
                                            key={product.id}
                                            onClick={() => router.push(`/ad-products/${product.slug}`)}
                                            className="group relative shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105"
                                            style={{
                                                zIndex,
                                                transform: `scale(${scale})`,
                                                marginRight: isLeft ? -overlapPx : 0,
                                                marginLeft: isRight ? -overlapPx : 0,
                                            }}
                                        >
                                            {/* iPhone frame */}
                                            <div className={cn(
                                                'w-[130px] h-[260px] sm:w-[150px] sm:h-[300px] md:w-[260px] md:h-[520px] rounded-[24px] sm:rounded-[28px] md:rounded-[36px] overflow-hidden',
                                                'border-[3px] border-gray-700 bg-black shadow-2xl',
                                                'transition-all duration-300',
                                                'group-hover:border-[hsl(var(--ptr-primary))] group-hover:shadow-[0_0_30px_rgba(30,215,96,0.3)]'
                                            )}>
                                                {/* Screen content */}
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                    {/* Product name overlay — visible on hover */}
                                                    <div className={cn(
                                                        'absolute inset-0 flex items-center justify-center px-3',
                                                        'bg-black/50',
                                                        'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                                                    )}>
                                                        <p className="text-sm md:text-base font-spotify font-[900] text-center text-[hsl(var(--ptr-primary))] leading-tight drop-shadow-md">
                                                            {product.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
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
