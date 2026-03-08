"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

interface FeaturesProps {
    features: {
        id: number;
        icon?: React.ComponentType<{ size?: number | string }>;
        title: string;
        description: string;
        image?: string;
        diagram?: React.ReactNode;
    }[];
    title?: string;
    subTitle?: string;
    primaryColor?: string;
}

export function Features({
    features,
    title,
    subTitle,
    primaryColor,
}: FeaturesProps) {
    const [currentFeature, setCurrentFeature] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Desktop scroll effect
    useEffect(() => {
        const activeFeatureElement = featureRefs.current[currentFeature];
        const container = containerRef.current;

        if (activeFeatureElement && container) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = activeFeatureElement.getBoundingClientRect();

            container.scrollTo({
                left:
                    activeFeatureElement.offsetLeft -
                    (containerRect.width - elementRect.width) / 2,
                behavior: "smooth",
            });
        }
    }, [currentFeature]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFeatureClick = (index: number) => {
        setCurrentFeature(index);
        setIsDropdownOpen(false);
    };

    return (
        <div className="min-h-screen py-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                {title && (
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <Image
                            src="/images/logo-white.png"
                            alt="Spotify Advertising"
                            width={150}
                            height={40}
                            className="mx-auto mb-6 h-12 w-auto"
                        />
                        {subTitle && (
                            <p className="text-sm md:text-base text-muted-foreground font-medium uppercase">
                                {subTitle}
                            </p>
                        )}
                        <h2 className="text-2xl md:text-4xl font-thin uppercase text-white mt-4 mb-6">
                            {title}
                        </h2>
                    </div>
                )}

                {/* Mobile Layout: Dropdown Selector */}
                <div className="lg:hidden">
                    {/* Dropdown Selector */}
                    <div ref={dropdownRef} className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between p-4 bg-sk-gold rounded-lg border border-primary/20 shadow-lg transition-all duration-300"
                        >
                            <div className="text-left">
                                <h3 className="text-base font-semibold text-black">
                                    {features[currentFeature].title}
                                </h3>
                                <p className="text-sm text-black/60 mt-1">
                                    Tap untuk pilih model
                                </p>
                            </div>
                            <ChevronDown
                                className={`w-5 h-5 text-black transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute z-50 w-full mt-2 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden"
                                >
                                    {features.map((feature, index) => (
                                        <button
                                            key={feature.id}
                                            onClick={() => handleFeatureClick(index)}
                                            className={`w-full text-left p-4 transition-colors duration-200 border-b border-white/5 last:border-b-0
                                                ${currentFeature === index
                                                    ? "bg-primary/20 text-white"
                                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                                                }`}
                                        >
                                            <h3 className="font-semibold">{feature.title}</h3>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Active Feature Details */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`details-${currentFeature}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="p-4 mb-4"
                        >
                            <p className="text-sm text-white/70">
                                {features[currentFeature].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Diagram */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`diagram-mobile-${currentFeature}`}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="relative"
                        >
                            {features[currentFeature].diagram ? (
                                <div className="rounded-lg shadow-xl bg-black p-3 sm:p-4 overflow-hidden">
                                    {features[currentFeature].diagram}
                                </div>
                            ) : features[currentFeature].image ? (
                                <Image
                                    className="rounded-2xl border border-primary/20 shadow-xl"
                                    src={features[currentFeature].image}
                                    alt={features[currentFeature].title}
                                    width={600}
                                    height={400}
                                />
                            ) : null}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Desktop Layout: Side-by-Side */}
                <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16 items-start">
                    {/* Left Side - Features List */}
                    <div
                        ref={containerRef}
                        className="space-y-4"
                    >
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            const isActive = currentFeature === index;

                            return (
                                <div
                                    key={feature.id}
                                    ref={(el) => {
                                        featureRefs.current[index] = el;
                                    }}
                                    className="relative cursor-pointer"
                                    onClick={() => handleFeatureClick(index)}
                                >
                                    {/* Feature Content */}
                                    <div
                                        className={`
                                            flex flex-row items-start space-x-4 p-6 w-full max-w-2xl transition-all duration-300 rounded-lg border
                                            ${isActive
                                                ? "bg-sk-gold border-primary/20 shadow-lg"
                                                : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"
                                            }
                                        `}
                                    >
                                        {/* Icon */}
                                        {Icon && (
                                            <div
                                                className={`
                                                    p-3 rounded-lg transition-all duration-300
                                                    ${isActive
                                                        ? "bg-primary text-white"
                                                        : "bg-white/10 text-white/50"
                                                    }
                                                `}
                                            >
                                                <Icon size={24} />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="flex-1">
                                            <h3
                                                className={`
                                                    text-lg font-semibold mb-2 transition-colors duration-300
                                                    ${isActive
                                                        ? "text-black"
                                                        : "text-white/60"
                                                    }
                                                `}
                                            >
                                                {feature.title}
                                            </h3>
                                            <p
                                                className={`
                                                    transition-colors duration-300 text-sm
                                                    ${isActive
                                                        ? "text-black/70"
                                                        : "text-white/40"
                                                    }
                                                `}
                                            >
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Side - Image Display */}
                    <div className="relative w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`diagram-desktop-${currentFeature}`}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="relative"
                            >
                                {features[currentFeature].diagram ? (
                                    <div className="rounded-lg shadow-xl px-6 overflow-hidden">
                                        {features[currentFeature].diagram}
                                    </div>
                                ) : features[currentFeature].image ? (
                                    <Image
                                        className="rounded-2xl border border-primary/20 shadow-xl"
                                        src={features[currentFeature].image}
                                        alt={features[currentFeature].title}
                                        width={600}
                                        height={400}
                                    />
                                ) : null}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
