"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface CareerCardProps {
  className?: string
}

const CareerCard: React.FC<CareerCardProps> = ({ className = "" }) => {
  const [asciiArt, setAsciiArt] = useState<string>("")

  // Load ASCII art from public file
  useEffect(() => {
    fetch("/ascii-art-career.txt")
      .then((response) => response.text())
      .then((text) => setAsciiArt(text))
      .catch((error) => console.error("Failed to load ASCII art:", error))
  }, [])

  // Theme-based CSS variables using global theme
  const themeVars = {
    "--pca-background-color": "hsl(var(--ptr-background))",
    "--pca-background-glass": "hsl(var(--card) / 0.2)",
    "--pca-background-gradient-start": "hsl(var(--card) / 0.2)",
    "--pca-background-gradient-end": "transparent",
    "--pca-text-primary": "hsl(var(--ptr-primary))",
    "--pca-text-secondary": "hsl(var(--muted-foreground))",
    "--pca-border-color": "hsl(var(--border))",
    "--pca-border-main": "hsl(var(--border))",
    "--pca-shadow-color": "rgba(0, 0, 0, 0.12)", // Keeping as is, common shadow
    "--pca-container-background": "hsl(var(--card) / 0.4)",
    "--pca-container-gradient-start": "hsl(var(--card) / 0.4)",
    "--pca-container-gradient-end": "transparent",
  }

  return (
    <div
      className={className}
      style={
        {
          width: "100%",
          height: "100%",
          position: "relative",
          margin: "0 auto",
          ...themeVars,
        } as React.CSSProperties
      }
      role="img"
      aria-label="ASCII Art Illustration Profesional Experts"
    >
      {/* Inner content area with ASCII art */}
      <pre
        style={{
          fontFamily: "monospace",
          fontSize: "5px",
          lineHeight: "1.2",
          color: "var(--pca-text-primary)",
          whiteSpace: "pre",
          margin: 0,
          padding: 0,
          opacity: 1,
        }}
      >
        {asciiArt}
      </pre>
    </div>
  )
}

export default CareerCard
