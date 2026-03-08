'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Volume2 } from 'lucide-react'
import {
    TreeProvider,
    TreeView,
    TreeNode,
    TreeNodeTrigger,
    TreeNodeContent,
    TreeExpander,
    TreeIcon,
    TreeLabel,
} from '@/components/ui/tree'

interface AdProductWithFeatures {
    id: string
    name: string
    slug: string
    features: { id: string; name: string }[]
}

interface Props {
    adProducts: AdProductWithFeatures[]
    currentAdProductSlug: string
}

export function AdProductSidebar({ adProducts, currentAdProductSlug }: Props) {
    const router = useRouter()

    // Find which ad product is current so we can expand it by default
    const activeAdProductId = adProducts.find((p) => p.slug === currentAdProductSlug)?.id

    return (
        <nav className="hidden md:block w-52 flex-shrink-0 font-spotify">
            <TreeProvider
                defaultExpandedIds={activeAdProductId ? [activeAdProductId] : []}
                showIcons={false}
                showLines={false}
                selectable={false}
                indent={12}
            >
                <TreeView className="p-0 space-y-4">
                    {adProducts.map((adProduct, pIdx) => (
                        <TreeNode
                            key={adProduct.id}
                            nodeId={adProduct.id}
                            isLast={pIdx === adProducts.length - 1}
                        >
                            <TreeNodeTrigger
                                className={
                                    adProduct.slug === currentAdProductSlug
                                        ? 'bg-[hsl(var(--ptr-primary))] text-primary font-[900] hover:bg-[hsl(var(--ptr-primary))] rounded-xl px-2 py-1.5 mx-0'
                                        : 'hover:bg-white/10 rounded-xl px-2 py-1.5 mx-0'
                                }
                                onClick={() => router.push(`/ad-products/${adProduct.slug}`)}
                            >
                                <TreeLabel className={
                                    adProduct.slug === currentAdProductSlug
                                        ? 'text-base font-[900] tracking-wider text-primary'
                                        : 'text-base font-[900] tracking-wider text-white'
                                }>
                                    {adProduct.name}
                                </TreeLabel>
                                {adProduct.features.length > 0 && (
                                    <TreeExpander hasChildren className="ml-auto" />
                                )}
                            </TreeNodeTrigger>
                            {adProduct.features.length > 0 && (
                                <TreeNodeContent hasChildren>
                                    {adProduct.features.map((feature, fIdx) => (
                                        <TreeNode
                                            key={feature.id}
                                            nodeId={feature.id}
                                            level={1}
                                            isLast={fIdx === adProduct.features.length - 1}
                                        >
                                            <TreeNodeTrigger
                                                className="mt-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl px-2 py-1.5 mx-0"
                                            >
                                                <TreeExpander />
                                                <TreeIcon
                                                    icon={<Volume2 className="h-3.5 w-3.5" />}
                                                    className="text-white/50"
                                                />
                                                <TreeLabel className="text-sm text-white/70">
                                                    {feature.name}
                                                </TreeLabel>
                                            </TreeNodeTrigger>
                                        </TreeNode>
                                    ))}
                                </TreeNodeContent>
                            )}
                        </TreeNode>
                    ))}
                </TreeView>
            </TreeProvider>
            <Link
                href="/"
                className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors tracking-widest mt-4"
            >
                <ChevronLeft className="h-4 w-4" />
                Share your thoughts!
            </Link>
        </nav>
    )
}
