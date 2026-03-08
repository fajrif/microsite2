"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  TreeProvider,
  TreeView,
  TreeNode,
  TreeNodeTrigger,
  TreeNodeContent,
  TreeExpander,
  TreeIcon,
  TreeLabel,
} from "@/components/ui/tree"

interface ClassificationWithShowcases {
  id: string
  name: string
  showcases: { id: string; name: string; slug: string }[]
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [treeData, setTreeData] = useState<ClassificationWithShowcases[]>([])
  const pathname = usePathname()
  const router = useRouter()

  const isShowcaseDetail = pathname.startsWith('/showcases/') && pathname !== '/showcases'
  const currentShowcaseId = isShowcaseDetail ? pathname.split('/').pop() ?? '' : ''

  const activeClassificationId = treeData.find((c) =>
    c.showcases.some((s) => s.slug === currentShowcaseId)
  )?.id

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
      fetch('/api/classifications?withShowcases=true')
        .then((r) => r.json())
        .then((data) => setTreeData(data.classifications || []))
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
                defaultExpandedIds={activeClassificationId ? [activeClassificationId] : []}
                showIcons={false}
                showLines={false}
                selectable={false}
                indent={12}
              >
                <TreeView className="p-0 space-y-2">
                  {treeData.map((classification, cIdx) => (
                    <TreeNode
                      key={classification.id}
                      nodeId={classification.id}
                      isLast={cIdx === treeData.length - 1}
                    >
                      <TreeNodeTrigger className="hover:bg-white/10 rounded-xl px-2 py-1.5 mx-0">
                        <TreeLabel className="font-[900] tracking-widest text-white">
                          {classification.name}
                        </TreeLabel>
                        <TreeExpander hasChildren className="ml-auto" />
                      </TreeNodeTrigger>
                      <TreeNodeContent hasChildren>
                        {classification.showcases.map((showcase, sIdx) => (
                          <TreeNode
                            key={showcase.id}
                            nodeId={showcase.id}
                            level={1}
                            isLast={sIdx === classification.showcases.length - 1}
                          >
                            <TreeNodeTrigger
                              className={cn(
                                'mt-1 rounded-xl px-2 py-1.5 mx-0',
                                showcase.slug === currentShowcaseId
                                  ? 'bg-[hsl(var(--ptr-primary))] text-primary font-medium hover:bg-[hsl(var(--ptr-primary))]'
                                  : 'text-white/70 hover:text-white hover:bg-white/10'
                              )}
                              onClick={() => {
                                router.push(`/showcases/${showcase.slug}`)
                                setIsOpen(false)
                              }}
                            >
                              <TreeExpander />
                              <TreeIcon
                                icon={<Volume2 className="h-3.5 w-3.5" />}
                                className={
                                  showcase.slug === currentShowcaseId
                                    ? 'text-primary'
                                    : 'text-white'
                                }
                              />
                              <TreeLabel
                                className={cn(
                                  'text-sm',
                                  showcase.slug === currentShowcaseId
                                    ? 'text-primary font-medium'
                                    : 'text-white'
                                )}
                              >
                                {showcase.name}
                              </TreeLabel>
                            </TreeNodeTrigger>
                          </TreeNode>
                        ))}
                      </TreeNodeContent>
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
