import { useEffect, useRef, useState } from 'react'
// unused import removed

export const Joystick = ({ onMove }: { onMove: (x: number, y: number) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })

  const handleStart = (clientX: number, clientY: number) => {
    setActive(true)
    startPos.current = { x: clientX, y: clientY }
    setPos({ x: 0, y: 0 })
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!active) return
    const dx = clientX - startPos.current.x
    const dy = clientY - startPos.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = 40

    let x = dx
    let y = dy

    if (dist > maxDist) {
      x = (dx / dist) * maxDist
      y = (dy / dist) * maxDist
    }

    setPos({ x, y })
    onMove(x / maxDist, y / maxDist)
  }

  const handleEnd = () => {
    setActive(false)
    setPos({ x: 0, y: 0 })
    onMove(0, 0)
  }

  useEffect(() => {
    const move = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY)
    const end = () => handleEnd()

    if (active) {
      window.addEventListener('touchmove', move)
      window.addEventListener('touchend', end)
    }
    return () => {
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', end)
    }
  }, [active])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', bottom: '50px', left: '50px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)', touchAction: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000 // Ensure it's on top
      }}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
    >
      <div
        ref={knobRef}
        style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.8)',
          transform: `translate(${pos.x}px, ${pos.y}px)`
        }}
      />
    </div>
  )
}
