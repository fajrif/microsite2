'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface SlideData {
    image: string
    title: string
    description: string
    textColor?: string
    titleSize?: string
    descriptionSize?: string
}

interface ImageSliderProps {
    slides: SlideData[]
    autoPlayInterval?: number
    className?: string
}

export function ImageSlider({
    slides,
    autoPlayInterval = 5000,
    className
}: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === slides.length - 1 ? 0 : prevIndex + 1
            )
        }, autoPlayInterval)

        return () => clearInterval(interval)
    }, [slides.length, autoPlayInterval])

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }

    return (
        <div className={cn("relative w-full h-full overflow-hidden rounded-md", className)}>
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-1000",
                        index === currentIndex ? "opacity-100" : "opacity-0"
                    )}
                >
                    {/* Image */}
                    <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        priority={index === 0}
                    />

                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Text overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
                        <h3
                            className={cn(
                                "font-bold mb-2",
                                slide.titleSize || "text-2xl md:text-4xl"
                            )}
                            style={{ color: slide.textColor || 'white' }}
                        >
                            {slide.title}
                        </h3>
                        <p
                            className={cn(
                                "max-w-2xl",
                                slide.descriptionSize || "text-sm md:text-base"
                            )}
                            style={{ color: slide.textColor || 'white' }}
                        >
                            {slide.description}
                        </p>
                    </div>
                </div>
            ))}

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={cn(
                            "w-2.5 h-2.5 rounded-full transition-all duration-300",
                            index === currentIndex
                                ? "bg-white w-8"
                                : "bg-white/50 hover:bg-white/80"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
