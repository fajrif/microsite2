'use client'
import React, { useRef, useState } from "react"
import { motion } from "framer-motion"

interface GradientCardProps {
    children: React.ReactNode
    className?: string
    width?: string
    height?: string
    gradientColors?: {
        primary: string
        secondary: string
        accent: string
        borderGlow: string
    }
}

export const GradientCard: React.FC<GradientCardProps> = ({
    children,
    className = "",
    width = "360px",
    height = "450px",
    gradientColors = {
        primary: "rgba(172, 92, 255, 0.7)",    // Purple
        secondary: "rgba(56, 189, 248, 0.7)",  // Light blue
        accent: "rgba(161, 58, 229, 0.7)",     // Deep purple
        borderGlow: "rgba(172, 92, 255, 1)"    // Purple border glow
    }
}) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [rotation, setRotation] = useState({ x: 0, y: 0 })

    // Handle mouse movement for 3D effect
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect()

            // Calculate mouse position relative to card center
            const x = e.clientX - rect.left - rect.width / 2
            const y = e.clientY - rect.top - rect.height / 2

            // Calculate rotation (limited range for subtle effect)
            const rotateX = -(y / rect.height) * 5 // Max 5 degrees rotation
            const rotateY = (x / rect.width) * 5 // Max 5 degrees rotation

            setRotation({ x: rotateX, y: rotateY })
        }
    }

    // Reset rotation when not hovering
    const handleMouseLeave = () => {
        setIsHovered(false)
        setRotation({ x: 0, y: 0 })
    }

    return (
        <motion.div
            ref={cardRef}
            className={`relative isolate ${className}`}
            style={{
                width,
                height,
                borderRadius: "32px",
                WebkitBorderRadius: "32px",
                overflow: "hidden",
                backgroundColor: "#0e131f",
                boxShadow: "0 -10px 100px 10px rgba(78, 99, 255, 0.25), 0 0 10px 0 rgba(0, 0, 0, 0.5)",
                // Safari-specific fixes for rounded corners with overflow:hidden
                WebkitMaskImage: "-webkit-radial-gradient(white, black)",
                maskImage: "radial-gradient(white, black)",
                WebkitBackfaceVisibility: "hidden",
                backfaceVisibility: "hidden",
                willChange: "transform",
            } as React.CSSProperties}
            initial={{ y: 0 }}
            animate={{
                y: isHovered ? -5 : 0,
                rotateX: rotation.x,
                rotateY: rotation.y,
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            {/* Subtle glass reflection overlay */}
            <motion.div
                className="absolute inset-0 z-35 pointer-events-none"
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.05) 100%)",
                    backdropFilter: "blur(2px)",
                    WebkitBackdropFilter: "blur(2px)",
                    borderRadius: "inherit",
                }}
                animate={{
                    opacity: isHovered ? 0.7 : 0.5,
                    rotateX: -rotation.x * 0.2,
                    rotateY: -rotation.y * 0.2,
                }}
                transition={{
                    duration: 0.4,
                    ease: "easeOut"
                }}
            />

            {/* Dark background with black gradient */}
            <motion.div
                className="absolute inset-0 z-0"
                style={{
                    background: "linear-gradient(180deg, #000000 0%, #000000 70%)",
                }}
                animate={{
                    z: -1
                }}
            />

            {/* Noise texture overlay */}
            <motion.div
                className="absolute inset-0 opacity-30 mix-blend-overlay z-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
                animate={{
                    z: -0.5
                }}
            />

            {/* Subtle finger smudge texture for realism */}
            <motion.div
                className="absolute inset-0 opacity-10 mix-blend-soft-light z-11 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='smudge'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.01' numOctaves='3' seed='5' stitchTiles='stitch'/%3E%3CfeGaussianBlur stdDeviation='10'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23smudge)'/%3E%3C/svg%3E")`,
                    backdropFilter: "blur(1px)",
                }}
                animate={{
                    z: -0.25
                }}
            />

            {/* Purple/blue glow effect */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-2/3 z-20"
                style={{
                    background: `
            radial-gradient(ellipse at bottom right, ${gradientColors.primary} -10%, rgba(79, 70, 229, 0) 70%),
            radial-gradient(ellipse at bottom left, ${gradientColors.secondary} -10%, rgba(79, 70, 229, 0) 70%)
          `,
                    filter: "blur(40px)",
                }}
                animate={{
                    opacity: isHovered ? 0.9 : 0.8,
                    y: isHovered ? rotation.x * 0.5 : 0,
                    z: 0
                }}
                transition={{
                    duration: 0.4,
                    ease: "easeOut"
                }}
            />

            {/* Central purple glow */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-2/3 z-21"
                style={{
                    background: `
            radial-gradient(circle at bottom center, ${gradientColors.accent} -20%, rgba(79, 70, 229, 0) 60%)
          `,
                    filter: "blur(45px)",
                }}
                animate={{
                    opacity: isHovered ? 0.85 : 0.75,
                    y: isHovered ? `calc(10% + ${rotation.x * 0.3}px)` : "10%",
                    z: 0
                }}
                transition={{
                    duration: 0.4,
                    ease: "easeOut"
                }}
            />

            {/* Enhanced bottom border glow */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-[2px] z-25"
                style={{
                    background: "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.05) 100%)",
                }}
                animate={{
                    boxShadow: isHovered
                        ? `0 0 20px 4px ${gradientColors.borderGlow.replace(/[\d.]+\)$/, '0.9)')}, 0 0 30px 6px ${gradientColors.borderGlow.replace(/[\d.]+\)$/, '0.7)')}, 0 0 40px 8px rgba(56, 189, 248, 0.5)`
                        : `0 0 15px 3px ${gradientColors.borderGlow.replace(/[\d.]+\)$/, '0.8)')}, 0 0 25px 5px ${gradientColors.borderGlow.replace(/[\d.]+\)$/, '0.6)')}, 0 0 35px 7px rgba(56, 189, 248, 0.4)`,
                    opacity: isHovered ? 1 : 0.9,
                    z: 0.5
                }}
                transition={{
                    duration: 0.4,
                    ease: "easeOut"
                }}
            />

            {/* Left edge glow */}
            <motion.div
                className="absolute bottom-0 left-0 h-1/4 w-[1px] z-25 rounded-full"
                style={{
                    background: "linear-gradient(to top, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 20%, rgba(255, 255, 255, 0.3) 40%, rgba(255, 255, 255, 0.1) 60%, rgba(255, 255, 255, 0) 80%)",
                }}
                animate={{
                    boxShadow: isHovered
                        ? `0 0 20px 4px ${gradientColors.borderGlow.replace(/[\d.]+\)$/, '0.9)')}, 0 0 30px 6px ${gradientColors.borderGlow.replace(/[\d.]+\)$/, '0.7)')}, 0 0 40px 8px rgba(56, 189, 248, 0.5)`
                        : `0 0 15px 3px ${gradientColors.borderGlow.replace(/[\d.]+\)$/, '0.8)')}, 0 0 25px 5px ${gradientColors.borderGlow.replace(/[\d.]+\)$/, '0.6)')}, 0 0 35px 7px rgba(56, 189, 248, 0.4)`,
                    opacity: isHovered ? 1 : 0.9,
                    z: 0.5
                }}
                transition={{
                    duration: 0.4,
                    ease: "easeOut"
                }}
            />

            {/* Right edge glow */}
            <motion.div
                className="absolute bottom-0 right-0 h-1/4 w-[1px] z-25 rounded-full"
                style={{
                    background: "linear-gradient(to top, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 20%, rgba(255, 255, 255, 0.3) 40%, rgba(255, 255, 255, 0.1) 60%, rgba(255, 255, 255, 0) 80%)",
                }}
                animate={{
                    boxShadow: isHovered
                        ? `0 0 20px 4px ${gradientColors.borderGlow.replace(/[\d.]+\)$/, '0.9)')}, 0 0 30px 6px ${gradientColors.borderGlow.replace(/[\d.]+\)$/, '0.7)')}, 0 0 40px 8px rgba(56, 189, 248, 0.5)`
                        : `0 0 15px 3px ${gradientColors.borderGlow.replace(/[\d.]+\)$/, '0.8)')}, 0 0 25px 5px ${gradientColors.borderGlow.replace(/[\d.]+\)$/, '0.6)')}, 0 0 35px 7px rgba(56, 189, 248, 0.4)`,
                    opacity: isHovered ? 1 : 0.9,
                    z: 0.5
                }}
                transition={{
                    duration: 0.4,
                    ease: "easeOut"
                }}
            />

            {/* Card content */}
            <motion.div
                className="relative flex flex-col h-full p-8 z-40"
                animate={{
                    z: 2
                }}
            >
                {children}
            </motion.div>
        </motion.div>
    )
}
