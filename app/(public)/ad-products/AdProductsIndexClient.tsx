'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { GradualSpacing } from '@/components/ui/gradual-spacing'
import { AnimatedDiv } from "@/components/ui/animated-div"
import { PhotoGallery, PhotoGalleryItem } from '@/components/ui/photo-gallery'
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

interface AdProductsIndexClientProps {
    adProducts: AdProduct[]
}

export function AdProductsIndexClient({ adProducts }: AdProductsIndexClientProps) {
    const router = useRouter()

    const galleryItems: PhotoGalleryItem[] = adProducts.map((product) => ({
        id: product.id,
        src: product.image || '',
        alt: product.name,
        label: product.name,
        disabled: false,
        onClick: () => router.push(`/ad-products/${product.slug}`),
    }))

    return (
        <>
            <div className="absolute top-0 z-[0] h-screen w-screen bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(16,48,39,0.8),rgba(255,255,255,0))]" />
            <section className="min-h-screen bg-primary text-white">
                <div className="container mx-auto py-16 md:py-24 px-4">
                    {/* Logo */}
                    <AnimatedDiv id="ad-products-logo" delay={0}>
                        <div className="flex justify-center mb-10">
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
                    <GradualSpacing
                        text="Explore Our Ad Products:"
                        className="drop-shadow-sm font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-none -tracking-widest text-[hsl(var(--ptr-primary))] text-center"
                    />
                    <AnimatedDiv id="ad-products-subtitle" delay={0.1}>
                        <p className="mt-2 text-2xl md:text-4xl lg:text-5xl font-light text-[hsl(var(--ptr-primary))] text-center italic">
                            An interactive walk-through.
                        </p>
                    </AnimatedDiv>

                    {/* Subtitle */}
                    <AnimatedDiv id="ad-products-description" delay={0.2}>
                        <p className="mt-6 text-base md:text-lg text-white max-w-3xl mx-auto leading-relaxed text-center">
                            Grab your headphones & let&apos;s get started.
                        </p>
                    </AnimatedDiv>

                    {/* CTA Button */}
                    <AnimatedDiv id="ad-products-cta" delay={0.3}>
                        <div className="flex justify-center mt-8">
                            <ShinyButton
                                href={adProducts.length > 0 ? `/ad-products/${adProducts[0].slug}` : '#'}
                                className="text-white rounded-4xl text-base py-3"
                            >
                                Let&apos;s start!
                            </ShinyButton>
                        </div>
                    </AnimatedDiv>

                    {/* Ad Product Cards - Mobile Grid */}
                    <AnimatedDiv id="ad-products-grid-mobile" className="mt-12 grid grid-cols-2 gap-4 md:hidden" delay={0.4}>
                        {adProducts.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => router.push(`/ad-products/${product.slug}`)}
                                className="group text-left transition-all duration-300 w-full cursor-pointer"
                            >
                                <div className={cn(
                                    'w-full aspect-square rounded-2xl overflow-hidden border-4 transition-all duration-300 relative',
                                    'border-transparent group-hover:border-[hsl(var(--ptr-primary))] group-hover:shadow-lg group-hover:shadow-[hsl(var(--ptr-primary))]/20'
                                )}>
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <p className={cn(
                                    'mt-3 text-base font-spotify font-[900] transition-colors duration-300',
                                    'text-white group-hover:text-[hsl(var(--ptr-primary))]'
                                )}>
                                    {product.name}
                                </p>
                            </button>
                        ))}
                    </AnimatedDiv>

                    {/* Ad Product Cards - Animated Gallery (desktop) */}
                    <div className="mt-12 hidden md:block">
                        <PhotoGallery items={galleryItems} animationDelay={0.6} />
                    </div>
                </div>
            </section>
        </>
    )
}
