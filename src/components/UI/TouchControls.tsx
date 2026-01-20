import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'

export const TouchControls = () => {
  const active = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const touchId = useRef<number | null>(null)
  
  // Joystick Safe Zone Configuration
  const JOYSTICK_ZONE = useRef({
    xMax: 170,
    yMin: 0 // calculated on mount
  })

  useEffect(() => {
    JOYSTICK_ZONE.current.yMin = window.innerHeight - 170
    
    const handleResize = () => {
        JOYSTICK_ZONE.current.yMin = window.innerHeight - 170
    }
    
    // Attach to WINDOW to capture swipes anywhere, but allow clicks to pass through to Canvas
    // We do NOT use a blocking div overlay.
    // However, to prevent scrolling issues, we rely on 'touch-action: none' in CSS.
    
    const handleStart = (e: TouchEvent) => {
        // We DON'T prevent default here always, because that might block clicks?
        // Actually, preventing 'touchstart' often blocks 'click'.
        // So we should NOT preventDefault on start if we want clicks to pass.
        // BUT we must preventDefault on MOVE to stop scrolling (handled by CSS touch-action usually, but explicit safety is good).
        
        const touches = e.changedTouches
        for (let i=0; i < touches.length; i++) {
            const touch = touches[i]
            
            if (active.current) continue

            // Safe Zones
            if (touch.clientX < JOYSTICK_ZONE.current.xMax && touch.clientY > JOYSTICK_ZONE.current.yMin) continue
            // Buttons Zone (Top Right)
            if (touch.clientX > window.innerWidth - 100 && touch.clientY < 150) continue

            active.current = true
            touchId.current = touch.identifier
            lastPos.current = { x: touch.clientX, y: touch.clientY }
        }
    }

    const handleMove = (e: TouchEvent) => {
        const touches = e.changedTouches
        for (let i=0; i < touches.length; i++) {
            const touch = touches[i]
            if (!active.current || touch.identifier !== touchId.current) continue
            
            if (useGameStore.getState().isGyroEnabled) continue
            
            // Prevent default ONLY if we are actively looking
            if (e.cancelable) e.preventDefault() 

            const dx = touch.clientX - lastPos.current.x
            const dy = touch.clientY - lastPos.current.y

            useGameStore.getState().addLookInput({ x: dx, y: dy })
            lastPos.current = { x: touch.clientX, y: touch.clientY }
        }
    }

    const handleEnd = (e: TouchEvent) => {
        const touches = e.changedTouches
         for (let i=0; i < touches.length; i++) {
            const touch = touches[i]
            if (touch.identifier === touchId.current) {
                active.current = false
                touchId.current = null
            }
        }
    }

    // Passive: false is needed for preventDefault in scroll blocking (though touch-action: none handles it mostly)
    window.addEventListener('touchstart', handleStart, { passive: false })
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleEnd, { passive: false })
    window.addEventListener('touchcancel', handleEnd, { passive: false })

    window.addEventListener('resize', handleResize)

    return () => {
        window.removeEventListener('touchstart', handleStart)
        window.removeEventListener('touchmove', handleMove)
        window.removeEventListener('touchend', handleEnd)
        window.removeEventListener('touchcancel', handleEnd)
        window.removeEventListener('resize', handleResize)
    }
  }, [])

  // No visual element needed, logic is global
  return null
}
