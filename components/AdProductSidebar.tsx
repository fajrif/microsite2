'use client'

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
    onShareThoughts?: () => void
}

export function AdProductSidebar({ adProducts, currentAdProductSlug, onShareThoughts }: Props) {
    const router = useRouter()

    return (
        <nav className="w-52 font-spotify">
            <TreeProvider
                defaultExpandedIds={[]}
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
                                        ? 'bg-[hsl(var(--ptr-primary))] text-primary font-[900] hover:bg-[hsl(var(--ptr-primary))] rounded-xl px-4 py-1.5 mx-0'
                                        : 'hover:bg-white/10 rounded-xl px-4 py-1.5 mx-0'
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
                            </TreeNodeTrigger>
                        </TreeNode>
                    ))}
                </TreeView>
            </TreeProvider>
            <button
                onClick={onShareThoughts}
                className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors tracking-widest mt-4 cursor-pointer"
            >
                <ChevronLeft className="h-4 w-4" />
                Share your thoughts!
            </button>
        </nav>
    )
}
