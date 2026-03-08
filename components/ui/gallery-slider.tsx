'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface GallerySliderProps {
    images: string[]
    alt?: string
}

export function GallerySlider({ images, alt = 'Image' }: GallerySliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    if (images.length === 0) return null

    const goToPrevious = () => {
        setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const goToNext = () => {
        setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
    }

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }

    // If only one image, show without controls
    if (images.length === 1) {
        return (
            <div className="rounded-2xl overflow-hidden border border-white/10">
                <img
                    src={images[0]}
                    alt={alt}
                    className="w-full h-auto object-cover"
                />
            </div>
        )
    }

    return (
        <div className="relative rounded-2xl overflow-hidden border border-white/10">
            {/* Main Image */}
            <div className="relative aspect-video">
                <img
                    src={images[currentIndex]}
                    alt={`${alt} ${currentIndex + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-300"
                />
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                aria-label="Previous image"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                aria-label="Next image"
            >
                <ChevronRight size={24} />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                ? 'bg-white w-6'
                                : 'bg-white/50 hover:bg-white/70'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Counter */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur text-white text-sm">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    )
}
