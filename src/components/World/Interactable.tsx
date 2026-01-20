import { useState } from 'react'
import { useCursor } from '@react-three/drei'
import { type ThreeEvent } from '@react-three/fiber'

interface InteractableProps {
  id?: string
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  children: React.ReactNode
  label?: string
}

export const Interactable = ({ onClick, children }: InteractableProps) => {
  const [hovered, setHover] = useState(false)
  useCursor(hovered)

  return (
    <group
      onPointerOver={(e) => { e.stopPropagation(); setHover(true) }}
      onPointerOut={(e) => { e.stopPropagation(); setHover(false) }}
      onClick={(e) => {
        if (onClick) onClick(e)
      }}
    >
      {/* Optional Highlight Effect can be added here or via children materials */}
      {children}
      {children}
    </group>
  )
}
