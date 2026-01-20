import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'

export const SoundEffects = ({ enabled = true }: { enabled?: boolean }) => {
  const puzzlePiecesFound = useGameStore(state => state.puzzlePiecesFound)
  const gameState = useGameStore(state => state.gameState)
  const prevCount = useRef(puzzlePiecesFound)
  const prevGameState = useRef(gameState)
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

  const playVictoryJingle = () => {
    if (!enabled || !audioCtx.current) return
    const ctx = audioCtx.current
    const t = ctx.currentTime

    // G Phrygian Dominant Scale: G, Ab, B, C, D, Eb, F, G
    // Frequencies: G4=392, Ab4=415.3, B4=493.9, C5=523.3, D5=587.3, Eb5=622.3, F5=698.5, G5=784

    const notes = [
      { freq: 392.00, time: 0.0, dur: 0.15 }, // G4
      { freq: 415.30, time: 0.15, dur: 0.15 }, // Ab4
      { freq: 493.88, time: 0.30, dur: 0.15 }, // B4
      { freq: 523.25, time: 0.45, dur: 0.15 }, // C5
      { freq: 587.33, time: 0.60, dur: 0.40 }, // D5 (Long)

      { freq: 622.25, time: 1.00, dur: 0.20 }, // Eb5
      { freq: 587.33, time: 1.20, dur: 0.20 }, // D5
      { freq: 523.25, time: 1.40, dur: 0.20 }, // C5
      { freq: 493.88, time: 1.60, dur: 0.20 }, // B4
      { freq: 392.00, time: 1.80, dur: 0.80 }, // G4 (Resolve)
    ]

    notes.forEach(n => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // Sawtooth for a brassy/accordion-ish sound
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(n.freq, t + n.time)

      // Envelope: Attack, Decay
      gain.gain.setValueAtTime(0, t + n.time)
      gain.gain.linearRampToValueAtTime(0.1, t + n.time + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, t + n.time + n.dur)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(t + n.time)
      osc.stop(t + n.time + n.dur + 0.1)
    })

    // Final Chord (G Major: G, B, D) to resolve comfortably
    const chordTime = t + 2.6
    const chordNotes = [392.00, 493.88, 587.33] // G4, B4, D5
    chordNotes.forEach(freq => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, chordTime)
      gain.gain.setValueAtTime(0, chordTime)
      gain.gain.linearRampToValueAtTime(0.1, chordTime + 0.1)
      gain.gain.exponentialRampToValueAtTime(0.01, chordTime + 1.5)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(chordTime)
      osc.stop(chordTime + 1.5)
    })
  }

  useEffect(() => {
    // Puzzle Piece Found
    if (puzzlePiecesFound > prevCount.current) {
      initAudio()
      playCoinSound()
    }
    prevCount.current = puzzlePiecesFound

    // Victory
    if (gameState === 'won' && prevGameState.current !== 'won') {
      initAudio()
      playVictoryJingle()
    }
    prevGameState.current = gameState

  }, [puzzlePiecesFound, gameState, enabled])

  return null
}
