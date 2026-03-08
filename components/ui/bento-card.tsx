import { ArrowRight } from "lucide-react"
import Link from "next/link"

type BentoCardProps = {
  title: string
  description: string
  link_href?: string
  link_label?: string
  Component: React.ComponentType
}

export function BentoCard({ title, description, link_href, link_label, Component }: BentoCardProps) {
  return (
    <div className="group overflow-hidden relative flex flex-col justify-start items-start border border-white/20 hover:bg-[rgba(66,83,79,0.08)] transition-all duration-300">
      {/* Background with blur effect */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(231, 236, 235, 0.08)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />
      {/* Additional subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

      <div className="self-stretch p-6 flex flex-col justify-start items-start gap-2 relative z-10">
        <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
          <p className="self-stretch text-white text-lg font-normal leading-7">
            {title} <br />
            <span className="text-base text-white/80">{description}</span>
          </p>
          {/* Link */}
          {link_href && (
            <Link href={link_href}>
              <div className="flex items-center gap-2 text-white/80 group-hover:text-[hsl(var(--ptr-primary))] group-hover:gap-3 transition-all pt-2">
                <span className="text-sm font-light">{link_label || "Lihat Selengkapnya"}</span>
                <ArrowRight size={16} />
              </div>
            </Link>
          )}
        </div>
      </div>
      <div className="self-stretch h-72 relative -mt-0.5 z-10">
        <Component />
      </div>
    </div>
  )
}
