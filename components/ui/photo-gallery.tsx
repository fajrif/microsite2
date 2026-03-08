"use client";

import { Ref, forwardRef, useState, useEffect, useRef } from "react";
import Image, { ImageProps } from "next/image";
import { motion, useMotionValue } from "framer-motion";

import { cn } from "@/lib/utils";

export interface PhotoGalleryItem {
  id: string;
  src: string;
  alt: string;
  label?: string;
  disabled?: boolean;
  onClick?: () => void;
}

type Direction = "left" | "right";

export const PhotoGallery = ({
  items,
  animationDelay = 0.5,
  gap = 16,
}: {
  items: PhotoGalleryItem[];
  animationDelay?: number;
  gap?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const visibilityTimer = setTimeout(() => setIsVisible(true), animationDelay * 1000);
    const animationTimer = setTimeout(() => setIsLoaded(true), (animationDelay + 0.4) * 1000);
    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(animationTimer);
    };
  }, [animationDelay]);

  const totalItems = items.length;
  const slotWidth = containerWidth > 0 ? containerWidth / totalItems : 0;
  const photoWidth = slotWidth > 0 ? Math.floor(slotWidth - gap) : 0;

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const photoVariants = {
    hidden: () => ({ x: 0, y: 0, rotate: 0, scale: 1 }),
    visible: (custom: { x: number; order: number }) => ({
      x: custom.x,
      y: 0,
      rotate: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 70,
        damping: 12,
        mass: 1,
        delay: custom.order * 0.15,
      },
    }),
  };

  const photos = items.map((item, index) => {
    const centerIndex = (totalItems - 1) / 2;
    const offset = (index - centerIndex) * slotWidth;
    return {
      ...item,
      order: index,
      x: offset,
      zIndex: (totalItems - index) * 10,
      direction: (index % 2 === 0 ? "left" : "right") as Direction,
    };
  });

  // height = photoWidth (square) + label area (~52px)
  const galleryHeight = photoWidth > 0 ? photoWidth + 52 : 300;

  return (
    <div ref={containerRef} className="w-full">
      <motion.div
        className="relative w-full"
        style={{ height: galleryHeight }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="relative flex w-full"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          {/* Anchor point at center */}
          <div
            className="relative"
            style={{ width: photoWidth, height: photoWidth, marginLeft: "auto", marginRight: "auto" }}
          >
            {[...photos].reverse().map((photo) => (
              <motion.div
                key={photo.id}
                className="absolute left-0 top-0"
                style={{ zIndex: photo.zIndex }}
                variants={photoVariants}
                custom={{ x: photo.x, order: photo.order }}
              >
                <Photo
                  width={photoWidth}
                  src={photo.src}
                  alt={photo.alt}
                  label={photo.label}
                  direction={photo.direction}
                  disabled={photo.disabled}
                  onClick={photo.onClick}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

const MotionImage = motion(
  forwardRef(function MotionImage(
    props: ImageProps,
    ref: Ref<HTMLImageElement>
  ) {
    return <Image ref={ref} {...props} />;
  })
);

export const Photo = ({
  src,
  alt,
  label,
  className,
  direction,
  width,
  disabled,
  onClick,
}: {
  src: string;
  alt: string;
  label?: string;
  className?: string;
  direction?: Direction;
  width: number;
  disabled?: boolean;
  onClick?: () => void;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  function handleMouse(event: {
    currentTarget: { getBoundingClientRect: () => DOMRect };
    clientX: number;
    clientY: number;
  }) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  const resetMouse = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      whileDrag={{ scale: 1.05, zIndex: 9999 }}
      style={{
        width,
        height: "auto",
        zIndex: 1,
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        touchAction: "none",
      }}
      className={cn(
        className,
        "group relative shrink-0",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing"
      )}
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
      draggable={false}
      tabIndex={0}
      onClick={disabled ? undefined : onClick}
    >
      <div
        className={cn(
          "relative w-full aspect-square overflow-hidden rounded-2xl shadow-sm border-4 transition-all duration-300",
          disabled
            ? "border-transparent"
            : "border-transparent hover:border-[hsl(var(--ptr-primary))] hover:shadow-lg hover:shadow-[hsl(var(--ptr-primary))]/20"
        )}
      >
        <MotionImage
          className="rounded-2xl object-cover"
          fill
          src={src}
          alt={alt}
          draggable={false}
          unoptimized
        />
      </div>
      {label && (
        <p
          className={cn(
            "mt-3 text-sm font-spotify font-[900] text-center transition-colors duration-300",
            disabled ? "text-white" : "text-white group-hover:text-[hsl(var(--ptr-primary))]"
          )}
        >
          {label}
        </p>
      )}
    </motion.div>
  );
};
