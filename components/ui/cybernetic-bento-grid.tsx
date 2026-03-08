'use client'

import React, { useRef, useEffect } from 'react'

const colSpanMap: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
}

const rowSpanMap: Record<number, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
}

const gridColsMap: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  6: 'grid-cols-6',
}

const gapMap: Record<string, string> = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
}

interface BentoItemProps {
  children: React.ReactNode
  className?: string
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6
  rowSpan?: 1 | 2 | 3
  spotlightColor?: string
}

export const BentoItem = ({
  children,
  className = '',
  colSpan = 1,
  rowSpan = 1,
  spotlightColor = 'rgba(255,255,255,0.10)',
}: BentoItemProps) => {
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

  const colClass = colSpanMap[colSpan] ?? 'col-span-1'
  const rowClass = rowSpanMap[rowSpan] ?? 'row-span-1'

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-neutral-900 p-6 ${colClass} ${rowClass} ${className}`}
    >
      {/* Spotlight overlay */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 z-[5] transition-opacity duration-300"
        style={{
          opacity: 0,
          background: `radial-gradient(300px circle at var(--mouse-x, -9999px) var(--mouse-y, -9999px), ${spotlightColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  )
}

interface CyberneticBentoGridProps {
  children: React.ReactNode
  cols?: 2 | 3 | 6
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export const CyberneticBentoGrid = ({
  children,
  cols = 3,
  gap = 'md',
  className = '',
}: CyberneticBentoGridProps) => {
  const colsClass = gridColsMap[cols] ?? 'grid-cols-3'
  const gapClass = gapMap[gap] ?? 'gap-4'

  return (
    <div className={`grid ${colsClass} ${gapClass} ${className}`}>
      {children}
    </div>
  )
}
