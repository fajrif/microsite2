"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";

interface ShutterTextProps {
  text: string;
  className?: string;
  sliceColor?: string;
  charDelay?: number;
  once?: boolean;
}

export function ShutterText({
  text,
  className,
  sliceColor = "hsl(var(--ptr-primary))",
  charDelay = 0.04,
  once = true,
}: ShutterTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, margin: "-50px" });
  const characters = text.split("");

  return (
    <span ref={ref} className={cn("inline-flex flex-wrap", className)}>
      {characters.map((char, i) => (
        <span key={i} className="relative overflow-hidden inline-block">
          {/* Main character */}
          <motion.span
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(10px)" }}
            transition={{ delay: i * charDelay + 0.3, duration: 0.8 }}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>

          {/* Top slice */}
          <motion.span
            initial={{ x: "-100%", opacity: 0 }}
            animate={isInView ? { x: "100%", opacity: [0, 1, 0] } : { x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.7,
              delay: i * charDelay,
              ease: "easeInOut",
            }}
            className="absolute inset-0 inline-block pointer-events-none z-10"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 35%)",
              color: sliceColor,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>

          {/* Middle slice */}
          <motion.span
            initial={{ x: "100%", opacity: 0 }}
            animate={isInView ? { x: "-100%", opacity: [0, 1, 0] } : { x: "100%", opacity: 0 }}
            transition={{
              duration: 0.7,
              delay: i * charDelay + 0.1,
              ease: "easeInOut",
            }}
            className="absolute inset-0 inline-block pointer-events-none z-10 text-white/80"
            style={{
              clipPath: "polygon(0 35%, 100% 35%, 100% 65%, 0 65%)",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>

          {/* Bottom slice */}
          <motion.span
            initial={{ x: "-100%", opacity: 0 }}
            animate={isInView ? { x: "100%", opacity: [0, 1, 0] } : { x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.7,
              delay: i * charDelay + 0.2,
              ease: "easeInOut",
            }}
            className="absolute inset-0 inline-block pointer-events-none z-10"
            style={{
              clipPath: "polygon(0 65%, 100% 65%, 100% 100%, 0 100%)",
              color: sliceColor,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
