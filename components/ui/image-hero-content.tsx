'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { TextEffect } from '@/components/ui/text-effect';

interface ImageHeroContentProps {
  image: string;
  text: string;
}

export function ImageHeroContent({ image, text }: ImageHeroContentProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [image]);

  return (
    <div className="container mx-auto px-0 sm:px-4 pt-20">
      {/* Image container */}
      <div className="relative h-[calc(100vh-5rem)] overflow-hidden">
        {/* Background Image with smooth fade-in transition */}
        <AnimatePresence>
          <motion.div
            key={image}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={loaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            <Image
              src={image}
              alt={text}
              fill
              priority
              className="object-cover object-center"
              onLoad={() => setLoaded(true)}
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
          </motion.div>
        </AnimatePresence>

        {/* Centered text */}
        <div className="relative z-10 flex h-full items-center justify-center px-8 text-center">
          <TextEffect
            per="word"
            preset="blur"
            delay={0.6}
            as="h1"
            className="max-w-5xl text-3xl font-light uppercase leading-tight tracking-widest text-white sm:text-4xl md:text-4xl lg:text-4xl"
          >
            {text}
          </TextEffect>
        </div>
      </div>
    </div>
  );
}
