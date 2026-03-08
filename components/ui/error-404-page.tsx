"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShinyButton } from '@/components/ui/shiny-button';

export const NotFound = () => {
  return (
    <div className="h-screen w-full relative bg-primary font-[family-name:var(--font-inter)]">
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
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative flex flex-col gap-4 items-center justify-center px-4">
          <div className="text-center z-10">
            <Image
              src="/images/logo.png"
              alt="Spotify Advertising"
              width={80}
              height={80}
              className="mb-8 w-24 md:w-32 lg:w-40 h-auto mx-auto block"
              unoptimized
            />
            <div className="text-center max-w-3xl mb-10">
              <div className="drop-shadow-sm font-display text-3xl md:text-5xl lg:text-5xl font-bold leading-none --tracking-widest text-[hsl(var(--ptr-primary))] mb-2 font-spotify">
                404
              </div>
              <p className="text-xl md:text-2xl text-white leading-relaxed">
                找不到您要查找的页面。
              </p>
            </div>
            <ShinyButton
              href="/"
              className={`text-white rounded-4xl text-base py-3 mb-12 md:mb-16`}
            >
              回到家
            </ShinyButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
