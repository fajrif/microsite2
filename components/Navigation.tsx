"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  TreeProvider,
  TreeView,
  TreeNode,
  TreeNodeTrigger,
  TreeLabel,
} from "@/components/ui/tree"

interface AdProductWithFeatures {
  id: string
  name: string
  slug: string
  features: { id: string; name: string }[]
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [treeData, setTreeData] = useState<AdProductWithFeatures[]>([])
  const pathname = usePathname()
  const router = useRouter()

  const isAdProductDetail = pathname.startsWith('/ad-products/') && pathname !== '/ad-products'
  const currentAdProductSlug = isAdProductDetail ? pathname.split('/').pop() ?? '' : ''


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isOpen && treeData.length === 0) {
      fetch('/api/ad-products?all=true')
        .then((r) => r.json())
        .then((data) => setTreeData(data.adProducts || []))
        .catch(() => { })
    }
  }, [isOpen, treeData.length])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? "bg-primary/60 backdrop-blur-lg shadow-sm"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto">
        <div className={cn(
          "flex items-center justify-between transition-all duration-300",
          isScrolled ? "h-16" : "h-20"
        )}>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Spotify Advertising"
              width={180}
              height={50}
              className={cn(
                "w-auto transition-all duration-300",
                isScrolled ? "h-8 md:h-10" : "h-10 md:h-12"
              )}
              unoptimized
              priority
            />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 bg-black text-base text-white font-spotify shadow-lg rounded-b-lg px-4 pt-2 mb-4">
            {treeData.length > 0 && (
              <TreeProvider
                defaultExpandedIds={[]}
                showIcons={false}
                showLines={false}
                selectable={false}
                indent={12}
              >
                <TreeView className="p-0 space-y-2">
                  {treeData.map((adProduct, pIdx) => (
                    <TreeNode
                      key={adProduct.id}
                      nodeId={adProduct.id}
                      isLast={pIdx === treeData.length - 1}
                    >
                      <TreeNodeTrigger
                        className={cn(
                          'rounded-xl px-2 py-1.5 mx-0',
                          adProduct.slug === currentAdProductSlug
                            ? 'bg-[hsl(var(--ptr-primary))] text-primary font-medium hover:bg-[hsl(var(--ptr-primary))]'
                            : 'hover:bg-white/10'
                        )}
                        onClick={() => {
                          router.push(`/ad-products/${adProduct.slug}`)
                          setIsOpen(false)
                        }}
                      >
                        <TreeLabel className={cn(
                          'font-[900] tracking-widest',
                          adProduct.slug === currentAdProductSlug ? 'text-primary' : 'text-white'
                        )}>
                          {adProduct.name}
                        </TreeLabel>
                      </TreeNodeTrigger>
                    </TreeNode>
                  ))}
                </TreeView>
              </TreeProvider>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
