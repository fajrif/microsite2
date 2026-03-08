"use client"

import * as React from "react"
import Image from "next/image"
import { ImageLightbox } from "@/components/ui/image-lightbox"
import { cn } from "@/lib/utils"

interface GalleryImage {
    src: string
    alt?: string
}

interface GalleryProps {
    images: GalleryImage[]
    className?: string
}

export function Gallery({ images, className }: GalleryProps) {
    const [lightboxOpen, setLightboxOpen] = React.useState(false)
    const [selectedIndex, setSelectedIndex] = React.useState(0)

    const openLightbox = (index: number) => {
        setSelectedIndex(index)
        setLightboxOpen(true)
    }

    return (
        <>
            <div
                className={cn(
                    "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3",
                    className
                )}
            >
                {images.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => openLightbox(index)}
                        className="group relative aspect-[4/3] overflow-hidden border border-white/10 bg-white/5 transition-all duration-300 hover:border-white/30 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer"
                    >
                        <Image
                            src={image.src}
                            alt={image.alt || `Gallery image ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-300 grayscale hover:grayscale-0 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    </button>
                ))}
            </div>

            <ImageLightbox
                images={images}
                initialIndex={selectedIndex}
                open={lightboxOpen}
                onOpenChange={setLightboxOpen}
            />
        </>
    )
}
