'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SurveyEditDialogProps {
    survey: { id: string; rating: number }
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function SurveyEditDialog({ survey, open, onOpenChange, onSuccess }: SurveyEditDialogProps) {
    const [rating, setRating] = useState(survey.rating)
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        if (rating < 1 || rating > 10) {
            toast.error('Rating must be between 1 and 10')
            return
        }
        setSaving(true)
        try {
            const res = await fetch(`/api/surveys/${survey.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating }),
            })
            if (!res.ok) throw new Error('Failed to update')
            toast.success('Survey updated')
            onSuccess()
        } catch {
            toast.error('Failed to update survey')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Edit Survey Rating</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="rating">Rating (1-10)</Label>
                        <Input
                            id="rating"
                            type="number"
                            min={1}
                            max={10}
                            value={rating}
                            onChange={(e) => setRating(parseInt(e.target.value) || 1)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
