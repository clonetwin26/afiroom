import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Reorder } from 'framer-motion'

export const PuzzleBoard = () => {
  const { secretCode, setGameState } = useGameStore()
  const [items, setItems] = useState<number[]>([])

  const totalPieces = 5 // Hardcoded match store for now

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

    // Draw background
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, width, height)

    // Draw Code
    ctx.font = 'bold 60px monospace'
    ctx.fillStyle = '#333'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // Space out the code e.g. "1 2 3 4" or just "1234"
    // Ideally we want the code to be split across pieces.
    // If code is 4 digits, but 5 pieces?
    // Let's just draw the code centered.
    ctx.fillText(secretCode, width / 2, height / 2)

    // Generate noise/lines to make it look like a ripped paper
    ctx.strokeStyle = '#999'
    ctx.beginPath()
    for (let i = 0; i < width; i += 20) {
      ctx.moveTo(i, 0)
      ctx.lineTo(i + Math.random() * 10 - 5, height)
    }
    ctx.stroke()

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

    // Shuffle initial positions
    const indices = Array.from({ length: totalPieces }, (_, i) => i)
    // Simple shuffle
    setItems(indices.sort(() => Math.random() - 0.5))

  }, [secretCode])

  const checkSolution = () => {
    // Check if items are sorted [0, 1, 2, 3, 4]
    const isSorted = items.every((val, i) => val === i)
    if (isSorted) {
      // Success
      setGameState('unlocked') // Or prompt user "You have the code!"
    }
  }

  // Check on every change
  useEffect(() => {
    if (items.length > 0) checkSolution()
  }, [items])

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto'
    }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <h2 style={{ color: 'white' }}>Arrange the fragments to reveal the code</h2>

      <Reorder.Group axis="x" values={items} onReorder={setItems} style={{ display: 'flex', gap: '5px', padding: '20px' }}>
        {items.map((index) => (
          <Reorder.Item key={index} value={index} style={{ cursor: 'grab' }}>
            <img src={dataUrls[index]} style={{ width: '100px', height: '100px', border: '1px solid #555' }} />
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <button onClick={() => setGameState('playing')} style={{ marginTop: '20px', padding: '10px' }}>
        Back to House
      </button>
    </div>
  )
}
