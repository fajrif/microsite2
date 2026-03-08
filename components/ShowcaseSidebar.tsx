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

interface ClassificationWithShowcases {
    id: string
    name: string
    showcases: { id: string; name: string; slug: string }[]
}

interface Props {
    classifications: ClassificationWithShowcases[]
    currentShowcaseId: string
}

export function ShowcaseSidebar({ classifications, currentShowcaseId }: Props) {
    const router = useRouter()

    // Find which classification contains the current showcase so we can expand it by default
    const activeClassificationId = classifications.find((c) =>
        c.showcases.some((s) => s.slug === currentShowcaseId)
    )?.id

    return (
        <nav className="hidden md:block w-52 flex-shrink-0 font-spotify">
            <TreeProvider
                defaultExpandedIds={activeClassificationId ? [activeClassificationId] : []}
                showIcons={false}
                showLines={false}
                selectable={false}
                indent={12}
            >
                <TreeView className="p-0 space-y-4">
                    {classifications.map((classification, cIdx) => (
                        <TreeNode
                            key={classification.id}
                            nodeId={classification.id}
                            isLast={cIdx === classifications.length - 1}
                        >
                            <TreeNodeTrigger className="hover:bg-white/10 rounded-xl px-2 py-1.5 mx-0">
                                <TreeLabel className="text-base font-[900] tracking-wider text-white">
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
                                            className={
                                                showcase.slug === currentShowcaseId
                                                    ? 'mt-2 bg-[hsl(var(--ptr-primary))] text-primary font-medium hover:bg-[hsl(var(--ptr-primary))] rounded-xl px-2 py-1.5 mx-0'
                                                    : 'mt-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl px-2 py-1.5 mx-0'
                                            }
                                            onClick={() => router.push(`/showcases/${showcase.slug}`)}
                                        >
                                            <TreeExpander />
                                            <TreeIcon
                                                icon={<Volume2 className="h-3.5 w-3.5" />}
                                                className={
                                                    showcase.slug === currentShowcaseId
                                                        ? 'text-primary'
                                                        : 'text-white/50'
                                                }
                                            />
                                            <TreeLabel
                                                className={
                                                    showcase.slug === currentShowcaseId
                                                        ? 'text-sm text-primary font-medium'
                                                        : 'text-sm text-white/70'
                                                }
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
            <Link
                href="/showcases"
                className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors tracking-widest mt-4"
            >
                <ChevronLeft className="h-4 w-4" />
                Back To Home
            </Link>
        </nav>
    )
}
