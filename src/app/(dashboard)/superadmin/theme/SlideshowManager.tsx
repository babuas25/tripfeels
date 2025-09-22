'use client'

import { useEffect, useState } from 'react'
import { deleteSlide, listSlides, type SlideDocument, updateSlide } from '@/lib/firebase/slides'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Save } from 'lucide-react'

export default function SlideshowManager() {
  const [slides, setSlides] = useState<SlideDocument[]>([])
  const [newSrc, setNewSrc] = useState('')
  const [newAlt, setNewAlt] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const refresh = async () => {
    const data = await listSlides()
    setSlides(data)
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleAdd = async () => {
    if (!newSrc.trim()) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/superadmin/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ src: newSrc.trim(), alt: newAlt.trim() })
      })
      if (!res.ok) throw new Error('Failed to add slide')
      setNewSrc('')
      setNewAlt('')
      await refresh()
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id?: string) => {
    if (!id) return
    await fetch(`/api/superadmin/slides/${id}`, { method: 'DELETE' })
    await refresh()
  }

  const handleAltUpdate = async (id?: string, alt?: string) => {
    if (!id) return
    await fetch(`/api/superadmin/slides/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alt: alt ?? '' })
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label>Image URL</Label>
          <Input placeholder="https://..." value={newSrc} onChange={(e) => setNewSrc(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Alt text</Label>
          <Input placeholder="Describe the image" value={newAlt} onChange={(e) => setNewAlt(e.target.value)} />
        </div>
      </div>
      <div>
        <Button onClick={handleAdd} disabled={isSaving} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Slide
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map((s) => (
          <div key={s.id} className="border rounded-lg overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt={s.alt ?? ''} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 space-y-2">
              <Label className="text-xs">Alt text</Label>
              <Input
                defaultValue={s.alt ?? ''}
                onBlur={(e) => handleAltUpdate(s.id, e.target.value)}
                placeholder="Describe this image"
              />
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => handleDelete(s.id)} className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


