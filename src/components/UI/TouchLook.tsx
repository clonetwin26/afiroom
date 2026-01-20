import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'

export const TouchLook = () => {
  const active = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const setLookInput = useGameStore(state => state.setLookInput)

  const handleStart = (clientX: number, clientY: number) => {
    active.current = true
    lastPos.current = { x: clientX, y: clientY }
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!active.current) return

    const dx = clientX - lastPos.current.x
    const dy = clientY - lastPos.current.y

    // Update store with delta
    // Sensitivity factor roughly 0.002
    setLookInput({ x: dx, y: dy })

    lastPos.current = { x: clientX, y: clientY }
  }

  const handleEnd = () => {
    active.current = false
    setLookInput({ x: 0, y: 0 })
  }

  useEffect(() => {
    // Clean up
    return () => setLookInput({ x: 0, y: 0 })
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '50%',
        height: '100%',
        zIndex: 50, // Below UI buttons but above canvas? 
        // Actually UI buttons are zIndex 100+, so this is fine.
        touchAction: 'none',
      }}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
    />
  )
}
