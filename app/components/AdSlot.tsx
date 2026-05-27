'use client'
// @ts-nocheck
import { useEffect, useRef, useState } from 'react'

interface AdSlotProps {
  slotId: string
  script?: string
  enabled?: boolean
  size?: string
  className?: string
  style?: React.CSSProperties
}

export default function AdSlot({ slotId, script: initialScript, enabled: initialEnabled, size, className, style }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [script, setScript] = useState(initialScript || '')
  const [enabled, setEnabled] = useState(initialEnabled !== false)
  const [loaded, setLoaded] = useState(false)

  // Fetch ad script from API if not provided
  useEffect(() => {
    if (initialScript) {
      setScript(initialScript)
      setLoaded(true)
      return
    }

    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/ads?slotId=${slotId}`)
        if (!res.ok) return
        const data = await res.json()
        const slot = Array.isArray(data) ? data.find((s: any) => s.slotId === slotId) : data
        if (slot && slot.enabled && slot.script) {
          setScript(slot.script)
          setEnabled(true)
        }
      } catch (err) {
        console.warn(`[AdSlot] Failed to fetch ${slotId}:`, err)
      }
      setLoaded(true)
    }

    fetchAd()
  }, [slotId, initialScript])

  // Inject script when it changes
  useEffect(() => {
    if (!enabled || !script || !ref.current || !loaded) return

    // Clear previous content
    ref.current.innerHTML = ''

    // Parse and inject the script tags + HTML
    const temp = document.createElement('div')
    temp.innerHTML = script

    // First inject any non-script HTML (like divs for native ads)
    Array.from(temp.childNodes).forEach(node => {
      if (node.nodeName !== 'SCRIPT') {
        ref.current!.appendChild(node.cloneNode(true))
      }
    })

    // Then execute scripts in order
    const scripts = temp.querySelectorAll('script')
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script')
      // Copy attributes
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value)
      })
      // Copy inline content
      if (oldScript.innerHTML) {
        newScript.innerHTML = oldScript.innerHTML
      }
      ref.current!.appendChild(newScript)
    })
  }, [enabled, script, loaded])

  if (!enabled || !script || !loaded) return null

  return (
    <div
      ref={ref}
      data-ad-slot={slotId}
      className={className}
      style={{ textAlign: 'center', overflow: 'hidden', ...style }}
    />
  )
}
