'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface SurveyDialogProps {
    adProductId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SurveyDialog({ adProductId, open, onOpenChange }: SurveyDialogProps) {
    const [rating, setRating] = useState(5)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const res = await fetch('/api/surveys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ad_product_id: adProductId, rating }),
            })

            if (res.status === 429) {
                toast.error('Too many requests. Please try again later.')
                return
            }

            if (!res.ok) {
                const data = await res.json()
                toast.error(data.error || 'Failed to submit survey')
                return
            }

            setSubmitted(true)
            toast.success('Thank you for your feedback!')

            setTimeout(() => {
                onOpenChange(false)
                // Reset after close animation
                setTimeout(() => {
                    setSubmitted(false)
                    setRating(5)
                }, 300)
            }, 2000)
        } catch {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => {
            onOpenChange(o)
            if (!o) {
                setTimeout(() => {
                    setSubmitted(false)
                    setRating(5)
                }, 300)
            }
        }}>
            <DialogContent
                showCloseButton={!submitted}
                className="bg-[#5FCDA9] border-none p-8 sm:p-10 max-w-xl sm:max-w-2xl"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <VisuallyHidden>
                    <DialogTitle>分享您的想法</DialogTitle>
                </VisuallyHidden>
                {submitted ? (
                    <div className="text-center text-primary py-8 space-y-4">
                        <div className="flex justify-center">
                            <CheckCircle className="w-16 h-16" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold">
                            感谢您的反馈!
                        </h2>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="text-center space-y-3">
                            <h2 className="text-2xl sm:text-3xl font-bold text-primary">
                                您的想法对我们很重要
                            </h2>
                            <p className="text-sm sm:text-base text-primary">
                                请问您在未来的营销计划中，考虑采用 Spotify 广告服务的意愿度是多少？（1为最低，10为最高）
                            </p>
                        </div>

                        {/* Custom slider */}
                        <div className="space-y-2 px-2">
                            <input
                                type="range"
                                min={1}
                                max={10}
                                step={1}
                                value={rating}
                                onChange={(e) => setRating(parseInt(e.target.value))}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer
                                    [&::-webkit-slider-runnable-track]:rounded-full
                                    [&::-webkit-slider-runnable-track]:h-2
                                    [&::-webkit-slider-thumb]:appearance-none
                                    [&::-webkit-slider-thumb]:w-6
                                    [&::-webkit-slider-thumb]:h-6
                                    [&::-webkit-slider-thumb]:rounded-full
                                    [&::-webkit-slider-thumb]:bg-gray-900
                                    [&::-webkit-slider-thumb]:mt-[-8px]
                                    [&::-webkit-slider-thumb]:cursor-pointer
                                    [&::-moz-range-track]:rounded-full
                                    [&::-moz-range-track]:h-2
                                    [&::-moz-range-thumb]:w-6
                                    [&::-moz-range-thumb]:h-6
                                    [&::-moz-range-thumb]:rounded-full
                                    [&::-moz-range-thumb]:bg-gray-900
                                    [&::-moz-range-thumb]:border-none
                                    [&::-moz-range-thumb]:cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #1a1a1a 0%, #1a1a1a ${((rating - 1) / 9) * 100}%, #e5e7eb ${((rating - 1) / 9) * 100}%, #e5e7eb 100%)`,
                                }}
                            />
                            <div className="flex justify-between text-sm font-semibold text-gray-900">
                                {Array.from({ length: 10 }, (_, i) => (
                                    <span key={i + 1} className="w-6 text-center">{i + 1}</span>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-700">
                                <span>不大可能</span>
                                <span>非常可能</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full max-w-sm py-4 px-8 bg-primary text-[hsl(var(--ptr-primary))] text-lg font-semibold rounded-full hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? '正在提交...' : '提交'}
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
