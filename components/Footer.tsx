import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="relative bg-primary text-white overflow-hidden">

      {/* Content */}
      <div className="relative container mx-auto px-4">
        {/* Copyright */}
        <div className="border-t border-white/20 py-3 text-xs md:text-sm text-muted-foreground">
          <p className="text-center">&copy; 2026 Spotify AB.</p>
        </div>
      </div>
    </footer>
  )
}
