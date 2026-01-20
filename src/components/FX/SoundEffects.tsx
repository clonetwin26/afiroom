import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'

export const SoundEffects = ({ enabled = true }: { enabled?: boolean }) => {
  const puzzlePiecesFound = useGameStore(state => state.puzzlePiecesFound)
  const prevCount = useRef(puzzlePiecesFound)
  const audioCtx = useRef<AudioContext | null>(null)

  const initAudio = () => {
    if (!audioCtx.current) {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext
      audioCtx.current = new AudioContext()
    }
    if (audioCtx.current?.state === 'suspended') {
      audioCtx.current.resume()
    }
  }

  const playCoinSound = () => {
    if (!enabled || !audioCtx.current) return

    const ctx = audioCtx.current
    const t = ctx.currentTime

    // Coin: High B -> E glissando rapid
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(987, t) // B5
    osc.frequency.linearRampToValueAtTime(1318, t + 0.08) // E6

    gain.gain.setValueAtTime(0.3, t)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(t)
    osc.stop(t + 0.4)
  }

  useEffect(() => {
    const handleInteract = () => initAudio()
    window.addEventListener('click', handleInteract)
    window.addEventListener('keydown', handleInteract)
    window.addEventListener('touchstart', handleInteract)
    return () => {
      window.removeEventListener('click', handleInteract)
      window.removeEventListener('keydown', handleInteract)
      window.removeEventListener('touchstart', handleInteract)
    }
  }, [])

  useEffect(() => {
    if (puzzlePiecesFound > prevCount.current) {
      initAudio() // Ensure context is ready
      playCoinSound()
    }
    prevCount.current = puzzlePiecesFound
  }, [puzzlePiecesFound, enabled])

  return null
}
