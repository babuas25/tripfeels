"use client"

import { useEffect, useState } from "react"
import { listSlides, type SlideDocument } from "@/lib/firebase/slides"

type Slide = SlideDocument & { id: string }

const AUTO_PLAY_MS = 4500

export function AuthSlideshow() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let mounted = true
    listSlides().then((docs) => {
      if (!mounted) return
      const withIds = docs.map((d, i) => ({ id: d.id ?? String(i), ...d })) as Slide[]
      setSlides(withIds)
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, AUTO_PLAY_MS)
    return () => clearInterval(interval)
  }, [slides.length])

  if (slides.length === 0) {
    return <div className="relative hidden lg:block lg:w-1/2 overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600" />
  }

  return (
    <div className="relative hidden lg:block lg:w-1/2 overflow-hidden">
      {slides.map((slide, i) => {
        const isActive = i === index
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={slide.src} alt={slide.alt ?? ""} className="w-full h-full object-cover absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/70 via-indigo-700/40 to-transparent" />
            {slide.alt && (
              <div className="absolute bottom-8 left-8 right-8">
                <blockquote className="max-w-md text-white text-lg leading-relaxed">
                  “{slide.alt}”
                </blockquote>
                <div className="mt-2 h-1 w-24 bg-white/70" />
              </div>
            )}
          </div>
        )
      })}

      {/* Dots */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((s, i) => (
          <span
            key={s.id}
            className={`h-1.5 w-6 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  )
}

export default AuthSlideshow


