import { useRef, useState } from 'react'
// unused import removed

export const Joystick = ({ onMove, style }: { onMove: (x: number, y: number) => void, style?: React.CSSProperties }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })
  const touchId = useRef<number | null>(null)

  const handleStart = (touch: React.Touch) => {
    setActive(true)
    touchId.current = touch.identifier
    startPos.current = { x: touch.clientX, y: touch.clientY }
    setPos({ x: 0, y: 0 })
  }

  const handleMove = (touch: React.Touch) => {
    if (!active || touch.identifier !== touchId.current) return
    const dx = touch.clientX - startPos.current.x
    const dy = touch.clientY - startPos.current.y
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

  const handleEnd = (touch: React.Touch) => {
    if (touch.identifier !== touchId.current) return
    setActive(false)
    touchId.current = null
    setPos({ x: 0, y: 0 })
    onMove(0, 0)
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', bottom: '50px', left: '50px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)', touchAction: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        ...style // Override defaults
      }}
      onTouchStart={(e) => {
        // Prevent default to stop scrolling if touching joystick
        e.preventDefault()
        if (!active) handleStart(e.changedTouches[0])
      }}
      onTouchMove={(e) => {
        e.preventDefault()
        for (let i = 0; i < e.changedTouches.length; i++) {
          handleMove(e.changedTouches[i])
        }
      }}
      onTouchEnd={(e) => {
        e.preventDefault()
        for (let i = 0; i < e.changedTouches.length; i++) {
          handleEnd(e.changedTouches[i])
        }
      }}
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
