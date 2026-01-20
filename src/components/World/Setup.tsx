import { useGameStore } from '../../store/gameStore'
// unused import removed

export const Setup = () => {
  const gameState = useGameStore((state) => state.gameState)

  if (gameState !== 'intro') return null

  return (
    <group position={[0, 2, 0]}>
      {/* We can't render HTML easily inside Setup if it's in Canvas in 3D...
            Wait, App.tsx put Setup OUTSIDE Canvas? No:
            <Canvas><Setup /></Canvas>
            So Setup must be 3D.
            But the User likely wanted a UI menu.
            Let's use HTML from Drei or just move logic to UI.tsx overlay.
            Logic seems better in UI overlay for inputs.
            I will leave this empty or just a start marker.
        */}
    </group>
  )
}
// Actually, I'll update UI.tsx instead for the slider.
