"use client"

import React, { useRef, useEffect } from "react"
import { Warp } from "@paper-design/shaders-react"

export type ShaderStyle = "style1" | "style2" | "style3" | "style4" | "style5" | "style6" | "style7"

interface FeatureShaderCardProps {
  number: number
  title: string
  description: string
  style?: ShaderStyle
  className?: string
}

const shaderConfigs: Record<ShaderStyle, {
  proportion: number
  softness: number
  distortion: number
  swirl: number
  swirlIterations: number
  shape: "checks" | "stripes" | "edge"
  shapeScale: number
  speed: number
  colors: string[]
}> = {
  style1: {
    proportion: 0.35,
    softness: 1.0,
    distortion: 0.18,
    swirl: 0.7,
    swirlIterations: 10,
    shape: "checks",
    shapeScale: 0.08,
    speed: 0.5,
    colors: ["hsl(220, 80%, 8%)", "hsl(225, 90%, 18%)", "hsl(215, 100%, 28%)", "hsl(210, 80%, 12%)"],
  },
  style2: {
    proportion: 0.4,
    softness: 1.2,
    distortion: 0.22,
    swirl: 0.9,
    swirlIterations: 12,
    shape: "stripes",
    shapeScale: 0.1,
    speed: 0.4,
    colors: ["hsl(225, 85%, 10%)", "hsl(230, 100%, 22%)", "hsl(220, 90%, 30%)", "hsl(235, 80%, 15%)"],
  },
  style3: {
    proportion: 0.3,
    softness: 0.9,
    distortion: 0.15,
    swirl: 0.6,
    swirlIterations: 8,
    shape: "checks",
    shapeScale: 0.12,
    speed: 0.6,
    colors: ["hsl(215, 90%, 7%)", "hsl(220, 85%, 20%)", "hsl(225, 100%, 32%)", "hsl(210, 90%, 14%)"],
  },
  style4: {
    proportion: 0.45,
    softness: 1.1,
    distortion: 0.2,
    swirl: 0.8,
    swirlIterations: 14,
    shape: "stripes",
    shapeScale: 0.09,
    speed: 0.45,
    colors: ["hsl(230, 80%, 9%)", "hsl(235, 95%, 24%)", "hsl(225, 85%, 35%)", "hsl(240, 75%, 16%)"],
  },
  style5: {
    proportion: 0.38,
    softness: 0.95,
    distortion: 0.17,
    swirl: 0.85,
    swirlIterations: 11,
    shape: "checks",
    shapeScale: 0.11,
    speed: 0.55,
    colors: ["hsl(220, 95%, 8%)", "hsl(215, 90%, 19%)", "hsl(220, 100%, 30%)", "hsl(225, 85%, 13%)"],
  },
  style6: {
    proportion: 0.42,
    softness: 1.0,
    distortion: 0.19,
    swirl: 0.75,
    swirlIterations: 9,
    shape: "stripes",
    shapeScale: 0.13,
    speed: 0.5,
    colors: ["hsl(225, 88%, 9%)", "hsl(220, 100%, 20%)", "hsl(215, 90%, 28%)", "hsl(230, 80%, 14%)"],
  },
  style7: {
    proportion: 0.36,
    softness: 1.05,
    distortion: 0.16,
    swirl: 0.65,
    swirlIterations: 10,
    shape: "checks",
    shapeScale: 0.1,
    speed: 0.48,
    colors: ["hsl(218, 92%, 8%)", "hsl(222, 88%, 18%)", "hsl(216, 100%, 26%)", "hsl(220, 84%, 12%)"],
  },
}

export function FeatureShaderCard({
  number,
  title,
  description,
  style = "style1",
  className = "",
}: FeatureShaderCardProps) {
  const config = shaderConfigs[style]

  const cardRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    const spotlight = spotlightRef.current
    if (!card || !spotlight) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      card.style.setProperty('--mouse-x', `${x}px`)
      card.style.setProperty('--mouse-y', `${y}px`)
      spotlight.style.opacity = '1'
    }

    const handleMouseLeave = () => {
      spotlight.style.opacity = '0'
    }

    card.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div ref={cardRef} className={`relative overflow-hidden border border-transparent transition-colors duration-300 hover:border-white ${className}`}>
      {/* Shader background */}
      <div className="absolute inset-0">
        <Warp
          style={{ height: "100%", width: "100%" }}
          proportion={config.proportion}
          softness={config.softness}
          distortion={config.distortion}
          swirl={config.swirl}
          swirlIterations={config.swirlIterations}
          shape={config.shape}
          shapeScale={config.shapeScale}
          scale={1}
          rotation={0}
          speed={config.speed}
          colors={config.colors}
        />
      </div>

      {/* Spotlight overlay */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 z-[5] transition-opacity duration-300"
        style={{
          opacity: 0,
          background: 'radial-gradient(280px circle at var(--mouse-x, -9999px) var(--mouse-y, -9999px), rgba(255,255,255,0.10), transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col p-6 md:p-8">
        <span className="mb-auto font-semibold text-white">{number}.</span>
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white md:text-base">
            {title}
          </h3>
          <p className="text-sm font-light leading-relaxed text-white/70">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
