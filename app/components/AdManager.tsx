'use client'
// @ts-nocheck
// AdManager — fetches all ad slots from DB and injects global ads (popunder etc.)
import { useEffect } from 'react'

export default function AdManager() {
  useEffect(() => {
    fetch('/api/ads')
      .then(r => r.json())
      .then((slots: any[]) => {
        if (!Array.isArray(slots)) return

        slots.forEach(slot => {
          if (!slot.enabled || !slot.script) return

          // Popunder — inject into <head> or <body> globally
          if (slot.slotId === 'popunder') {
            const existing = document.querySelector(`[data-ad-slot="popunder"]`)
            if (existing) return // already injected
            const wrapper = document.createElement('div')
            wrapper.setAttribute('data-ad-slot', 'popunder')
            wrapper.style.display = 'none'
            injectScript(slot.script, wrapper)
            document.body.appendChild(wrapper)
          }
        })
      })
      .catch(() => {})
  }, [])

  return null
}

function injectScript(script: string, container: HTMLElement) {
  const temp = document.createElement('div')
  temp.innerHTML = script

  // Inject non-script HTML
  Array.from(temp.childNodes).forEach(node => {
    if (node.nodeName !== 'SCRIPT') {
      container.appendChild(node.cloneNode(true))
    }
  })

  // Execute scripts
  temp.querySelectorAll('script').forEach(oldScript => {
    const newScript = document.createElement('script')
    Array.from(oldScript.attributes).forEach(attr => {
      newScript.setAttribute(attr.name, attr.value)
    })
    if (oldScript.innerHTML) newScript.innerHTML = oldScript.innerHTML
    container.appendChild(newScript)
  })
}
