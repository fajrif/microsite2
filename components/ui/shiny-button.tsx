'use client'

import type React from 'react'

interface ShinyButtonProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
  style?: React.CSSProperties
}

export function ShinyButton({
  children,
  onClick,
  href,
  className = '',
  style
}: ShinyButtonProps) {
  const classes = `shiny-cta ${className}`

  if (href) {
    return (
      <a href={href} className={classes} style={style}>
        <span>{children}</span>
      </a>
    )
  }

  return (
    <button className={classes} onClick={onClick} style={style}>
      <span>{children}</span>
    </button>
  )
}
