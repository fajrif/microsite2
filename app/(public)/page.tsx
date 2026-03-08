"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShinyButton } from '@/components/ui/shiny-button';

export default function HomePage() {

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
          src="/images/bg-home.png"
          alt="Background"
          fill
          className="object-cover object-center mb-16"
          priority
          unoptimized
      />
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <Image
            src="/images/logo.png"
            alt="Spotify Advertising"
            width={280}
            height={80}
            className="mb-8 w-48 md:w-60 lg:w-72 h-auto"
            unoptimized
        />
        <div className="text-center max-w-3xl mb-10">
          <div className="drop-shadow-sm font-display text-3xl md:text-5xl lg:text-5xl font-bold leading-none --tracking-widest text-[hsl(var(--ptr-primary))] mb-2">
            巧用 Spotify 平台创作成功故事：
          </div>
          <div className="drop-shadow-sm font-display text-3xl md:text-5xl lg:text-5xl font-light leading-none --tracking-widest text-[hsl(var(--ptr-primary))] mb-6 md:mb-10">
            您的互动营销指南
          </div>
          <p className="text-xl md:text-2xl text-white leading-relaxed">
            赶快戴上耳机，灵感即刻涌现
          </p>
        </div>
        <ShinyButton
            href="/showcases"
            className={`text-white rounded-4xl text-base py-3 mb-12 md:mb-16`}
        >
          马上开始！
        </ShinyButton>
      </motion.div>
    </div>
  )
}
