'use client'
// @ts-nocheck
import { useEffect, useRef } from 'react'

interface AdSlotProps {
  slotId: string
  script: string
  enabled: boolean
  size?: string
  className?: string
  style?: React.CSSProperties
}

export default function AdSlot({ slotId, script, enabled, size, className, style }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !script || !ref.current) return

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
  }, [enabled, script])

  if (!enabled || !script) return null

  return (
    <div
      ref={ref}
      data-ad-slot={slotId}
      className={className}
      style={{ textAlign: 'center', overflow: 'hidden', ...style }}
    />
  )
}
