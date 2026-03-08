'use client'

import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import { ShinyButton } from './shiny-button'

interface BenefitsSectionHeroProps {
    title: React.ReactNode;
    subtitle?: string;
    caption?: string;
    backgroundImage: string;
    ctaButton?: {
        text: string;
        href: string;
    };
    imagePosition?: 'left' | 'right';
    className?: string;
    variant?: 'dark' | 'light';
}

const BenefitsSectionHero: React.FC<BenefitsSectionHeroProps> = ({
    className,
    title,
    subtitle,
    caption,
    backgroundImage,
    ctaButton,
    imagePosition = 'right',
    variant = 'dark'
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Color classes based on variant
    const colors = {
        dark: {
            title: 'text-white',
            subtitle: 'text-white/70',
            caption: 'text-white/70',
            iconBg: 'bg-white/10',
            iconColor: 'text-white',
            hoverBg: 'hover:bg-white/5',
            ctaBg: 'bg-gray-900 hover:bg-gray-800',
            ctaText: 'text-white',
            accentBar: 'bg-white/40',
        },
        light: {
            title: '',
            subtitle: '',
            caption: '',
            iconBg: 'bg-[#dedede]',
            iconColor: 'text-gray-900',
            hoverBg: 'hover:bg-gray-900/5',
            ctaBg: 'bg-[#dedede] hover:bg-gray-900',
            ctaText: 'text-white',
            accentBar: 'bg-gray-900/30',
        }
    };

    const c = colors[variant];

    // Animation variants for the container
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    };

    // Animation variants for individual elements
    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
            },
        },
    };

    const ContentSection = (
        <div className="flex w-full flex-col bg-primary py-12 md:py-16 pl-8 md:pl-12 lg:pl-16 md:w-1/2 min-h-screen items-center md:items-start text-center md:text-left">
            <motion.div
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={containerVariants}
                className="flex flex-col h-full flex-1 w-full"
            >

                <motion.div variants={itemVariants} className="flex justify-center md:justify-start">
                    <Image
                        src="/images/logo.png"
                        alt="Spotify Advertising"
                        width={280}
                        height={80}
                        className="mb-8 w-48 md:w-60 lg:w-72 h-auto"
                        unoptimized
                    />
                </motion.div>

                <div className="flex-1 flex flex-col justify-center">
                    <motion.h1
                        className={`drop-shadow-sm font-display text-3xl md:text-5xl lg:text-5xl font-bold leading-none --tracking-widest text-[hsl(var(--ptr-primary))] ${c.title} mb-2`}
                        variants={itemVariants}
                    >
                        {title}
                    </motion.h1>

                    {caption && (
                        <motion.h1
                            className={`drop-shadow-sm font-display text-3xl md:text-5xl lg:text-5xl font-light leading-none --tracking-widest text-[hsl(var(--ptr-primary))] ${c.title} mb-6 md:mb-8`}
                            variants={itemVariants}
                        >
                            {caption}
                        </motion.h1>
                    )}

                    {subtitle && (
                        <motion.p
                            className={`text-xl md:text-2xl text-white max-w-3xl ${c.subtitle} leading-relaxed`}
                            variants={itemVariants}
                        >
                            {subtitle}
                        </motion.p>
                    )}
                </div>

                {ctaButton && (
                    <motion.div className="flex justify-center md:justify-start" variants={itemVariants}>
                        <ShinyButton
                            href={ctaButton.href}
                            className={`text-white rounded-4xl text-base py-3 mb-12 md:mb-16`}
                        >
                            {ctaButton.text}
                        </ShinyButton>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );

    const ImageSection = (
        <div className="hidden md:block relative min-h-[300px] w-full md:min-h-screen md:w-1/2 pr-8 md:pr-12 lg:pr-16 pl-0">
            <motion.div
                className="relative w-full h-full overflow-hidden"
                initial={{
                    clipPath: imagePosition === 'right'
                            ? 'ellipse(0% 0% at 100% 50%)'
                            : 'ellipse(0% 0% at 0% 50%)'
                }}
                animate={isVisible ? {
                    clipPath: imagePosition === 'right'
                            ? 'ellipse(100% 100% at 100% 50%)'
                            : 'ellipse(100% 100% at 0% 50%)'
                } : {
                    clipPath: imagePosition === 'right'
                            ? 'ellipse(0% 0% at 100% 50%)'
                            : 'ellipse(0% 0% at 0% 50%)'
                }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                    }}
                />
                {/* Curved overlay for visual interest */}
                <div
                    className={`absolute inset-0 ${variant === 'light' ? 'bg-gradient-to-r from-sk-gold/60 to-transparent' : 'bg-gradient-to-r from-black/40 to-transparent'}`}
                    style={{
                        clipPath: imagePosition === 'right'
                            ? 'ellipse(100% 100% at 100% 50%)'
                            : 'ellipse(100% 100% at 0% 50%)'
                    }}
                />
            </motion.div>
        </div>
    );

    return (
        <section
            className={cn(
                "relative flex min-h-screen w-full flex-col overflow-hidden md:flex-row",
                className
            )}
        >
            {imagePosition === 'left' ? (
                <>
                    {ImageSection}
                    {ContentSection}
                </>
            ) : (
                <>
                    {ContentSection}
                    {ImageSection}
                </>
            )}
        </section>
    );
};

BenefitsSectionHero.displayName = "BenefitsSectionHero";

export { BenefitsSectionHero };
