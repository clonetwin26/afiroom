import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { motion } from 'framer-motion'

export const PuzzleBoard = () => {
  const { secretCode, setGameState, totalPuzzlePieces, puzzlePiecesFound } = useGameStore()

  // Store positions and Z-index
  const [pieces, setPieces] = useState<{ id: number, x: number, y: number, z: number }[]>([])
  const [maxZ, setMaxZ] = useState(100)

  // Handle 0 pieces (auto-win) without defaulting to 5
  const totalPieces = totalPuzzlePieces

  // Generate a canvas with the code
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dataUrls, setDataUrls] = useState<string[]>([])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 500
    const height = 100
    const pWidth = width / totalPieces

    canvas.width = width
    canvas.height = height

    // Draw Gradient Background (Rainbow)
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, '#ff9999') // Red-ish
    gradient.addColorStop(0.2, '#ffcc99') // Orange-ish
    gradient.addColorStop(0.4, '#ffff99') // Yellow-ish
    gradient.addColorStop(0.6, '#ccff99') // Green-ish
    gradient.addColorStop(0.8, '#99ccff') // Blue-ish
    gradient.addColorStop(1, '#cc99ff') // Purple-ish
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Draw Code
    ctx.font = 'bold 60px monospace'
    ctx.fillStyle = '#333'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(secretCode, width / 2, height / 2)

    // Generate noise
    ctx.strokeStyle = '#fff'
    ctx.globalAlpha = 0.3
    ctx.beginPath()
    for (let i = 0; i < width; i += 5) {
      ctx.moveTo(i, 0)
      ctx.lineTo(i + Math.random() * 20 - 10, height)
    }
    ctx.stroke()
    ctx.globalAlpha = 1.0

    // Slice
    const urls: string[] = []
    for (let i = 0; i < totalPieces; i++) {
      const pCanvas = document.createElement('canvas')
      pCanvas.width = pWidth
      pCanvas.height = height
      const pCtx = pCanvas.getContext('2d')
      if (pCtx) {
        pCtx.drawImage(canvas, i * pWidth, 0, pWidth, height, 0, 0, pWidth, height)
        urls.push(pCanvas.toDataURL())
      }
    }
    setDataUrls(urls)

    // Initial Random Positions
    if (totalPieces > 0) {
      const initialPieces = Array.from({ length: totalPieces }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300,
        z: i
      }))
      setPieces(initialPieces)
      setMaxZ(totalPieces)
    }

  }, [secretCode, totalPieces])

  // Solved Condition: Just finding all pieces!
  const isAllFound = puzzlePiecesFound === totalPieces

  const handleDragStart = (id: number) => {
    // Bring to front
    const newMaxZ = maxZ + 1
    setMaxZ(newMaxZ)
    setPieces(prev => prev.map(p => p.id === id ? { ...p, z: newMaxZ } : p))
  }

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto', zIndex: 5000,
      overflow: 'hidden'
    }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <h2 style={{ color: 'white', marginBottom: '20px', zIndex: 10 }}>
        {isAllFound
          ? 'Puzzle Complete! Code Unlocked:'
          : `Find all pieces to unlock code! (${puzzlePiecesFound}/${totalPieces})`}
      </h2>

      {isAllFound && (
        <div style={{
          fontSize: '60px', fontWeight: 'bold', color: 'gold',
          marginBottom: '40px', padding: '10px 30px', border: '4px solid gold', borderRadius: '10px',
          zIndex: 10, background: 'rgba(0,0,0,0.8)'
        }}>
          {secretCode}
        </div>
      )}

      {/* Container for drag area */}
      <div style={{ position: 'relative', width: '80%', height: '60%', border: '2px dashed #555', borderRadius: '20px' }}>
        {pieces.map((piece) => {
          const isRevealed = piece.id < puzzlePiecesFound

          return (
            <motion.div
              key={piece.id}
              drag
              dragMomentum={false}
              initial={{ x: piece.x, y: piece.y }}
              onPointerDown={() => handleDragStart(piece.id)}
              style={{
                position: 'absolute', top: '50%', left: '50%',
                marginLeft: '-50px', marginTop: '-50px', // Center
                cursor: 'grab', touchAction: 'none',
                zIndex: piece.z
              }}
              whileDrag={{ scale: 1.1, cursor: 'grabbing', zIndex: maxZ + 1000 }}
            >
              {isRevealed ? (
                <img
                  src={dataUrls[piece.id]}
                  style={{
                    width: '100px', height: '100px', border: '1px solid #fff',
                    pointerEvents: 'none', userSelect: 'none', WebkitUserSelect: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                  }}
                  draggable={false}
                />
              ) : (
                <div style={{
                  width: '100px', height: '100px', border: '1px solid #555',
                  background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#555', fontSize: '40px', fontWeight: 'bold',
                  userSelect: 'none', WebkitUserSelect: 'none',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}>
                  ?
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <button onClick={() => setGameState('playing')} style={{ marginTop: '20px', padding: '10px 20px', zIndex: 10, fontSize: '18px' }}>
        {isAllFound ? 'Close & Go To Safe' : 'Back to Search'}
      </button>


    </div>
  )
}
