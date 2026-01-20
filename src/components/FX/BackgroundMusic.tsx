import { useEffect, useRef } from 'react'

export const BackgroundMusic = ({ enabled }: { enabled: boolean }) => {
  const audioCtx = useRef<AudioContext | null>(null)
  const gainNode = useRef<GainNode | null>(null)


  // Ref to track current enabled state for initAudio
  const enabledRef = useRef(enabled)
  useEffect(() => { enabledRef.current = enabled }, [enabled])

  const initAudio = () => {
    if (audioCtx.current) return

    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext
    const ctx = new AudioContext()
    audioCtx.current = ctx

    // Master Gain
    const masterGain = ctx.createGain()
    masterGain.connect(ctx.destination)
    // Use current ref value, not stale prop closure
    masterGain.gain.value = enabledRef.current ? 0.3 : 0
    gainNode.current = masterGain

    // Phoenix Wright Investigation Style
    // Faster, busy, thinking music.
    // Base tempo: ~135 BPM

    // Passover Mystery Vamp (Klezmer/Phrygian Dominant)
    // Style: Accordion/Clarinet-ish Sawtooth
    // Key: G Phrygian (G, Ab, B, C, D, Eb, F, G)
    // Tempo: ~110 BPM (16th note ~= 0.136s)

    const baseTime = 0.14

    // Frequencies
    const G3 = 196.00
    const D3 = 146.83

    const G4 = 392.00
    const Ab4 = 415.30
    const B4 = 493.88
    const C5 = 523.25
    const D5 = 587.33
    const Eb5 = 622.25
    const F5 = 698.46
    const G5 = 783.99

    // Sequence (16 steps per bar, 4 bars)
    // Melody + Bass lines? We'll just interleave or simple polyphony later if needed.
    // Let's do a single monophonic melody line that implies the harmony (Bach cello style?)
    // actually we can schedule multiple notes.

    const sequence = [
      // Bar 1: G Major ish
      { f: G4, d: 2 }, { f: B4, d: 2 }, { f: D5, d: 2 }, { f: Eb5, d: 2 },
      { f: D5, d: 2 }, { f: B4, d: 2 }, { f: G4, d: 2 }, { f: Ab4, d: 2 },

      // Bar 2: Tension
      { f: B4, d: 2 }, { f: D5, d: 2 }, { f: Eb5, d: 2 }, { f: F5, d: 2 },
      { f: Eb5, d: 2 }, { f: D5, d: 2 }, { f: C5, d: 2 }, { f: B4, d: 2 },

      // Bar 3: C Minor ish
      { f: C5, d: 2 }, { f: Eb5, d: 2 }, { f: G5, d: 2 }, { f: F5, d: 2 },
      { f: Eb5, d: 2 }, { f: D5, d: 2 }, { f: C5, d: 2 }, { f: B4, d: 2 },

      // Bar 4: Resolve to G
      { f: Ab4, d: 2 }, { f: B4, d: 2 }, { f: D5, d: 2 }, { f: C5, d: 2 },
      { f: B4, d: 2 }, { f: Ab4, d: 2 }, { f: G4, d: 4 }, // Long G
    ]

    let noteIdx = 0
    let nextNoteTime = ctx.currentTime
    let bassToggle = true

    const scheduler = () => {
      // Lookahead window
      while (nextNoteTime < ctx.currentTime + 0.1) {

        // --- BASS (Oom-pah) ---
        // Play bass on every 4 steps (quarter note)
        // Oom (Ratio 1) - Pah (Ratio 1.5 - Fifth)
        if (noteIdx % 4 === 0) {
          const bassOsc = ctx.createOscillator()
          const bassGain = ctx.createGain()
          bassOsc.type = 'triangle' // Softer bass
          // Alternating root/fifth: G3 then D3
          bassOsc.frequency.value = bassToggle ? G3 : D3
          bassToggle = !bassToggle

          bassGain.gain.setValueAtTime(0.15, nextNoteTime)
          bassGain.gain.exponentialRampToValueAtTime(0.01, nextNoteTime + 0.3)

          bassOsc.connect(bassGain)
          bassGain.connect(masterGain)
          bassOsc.start(nextNoteTime)
          bassOsc.stop(nextNoteTime + 0.3)
        }

        // --- MELODY ---
        const note = sequence[Math.floor(noteIdx / 1) % sequence.length] // 1 step = 1 item
        // Wait, note.d is duration in steps? 
        // My sequence array is just 16th notes.
        // Actually, let's keep it simple: strict 1/8th note grid?
        // Above sequence has 30 items. 
        // Let's iterate through the array.

        // We only play if it's the start of the note. 
        // But my array is just "Next note".
        // Let's just play them sequentially as 8th notes (d=2 16ths).

        if (note) {
          const osc = ctx.createOscillator()
          const g = ctx.createGain()

          osc.type = 'sawtooth' // Accordion vibe
          osc.frequency.value = note.f

          // Envelope
          const duration = note.d * baseTime // 2 * 0.14 = 0.28s
          g.gain.setValueAtTime(0.08, nextNoteTime)
          g.gain.linearRampToValueAtTime(0.06, nextNoteTime + 0.05)
          g.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + duration) 

          osc.connect(g)
          g.connect(masterGain)

          osc.start(nextNoteTime)
          osc.stop(nextNoteTime + duration)

          // Advance time
          nextNoteTime += duration
          noteIdx++
        }
      }
      requestAnimationFrame(scheduler)
    }
    requestAnimationFrame(scheduler)
  }

  useEffect(() => {
    // Init on first user interaction is handled by App usually, 
    // but we'll try to init on mount and resume on interaction if needed.
    // For simplicity, we assume user interacted if they are in game.

    const handleInteract = () => {
      if (!audioCtx.current) initAudio()
      if (audioCtx.current?.state === 'suspended') audioCtx.current.resume()
    }

    window.addEventListener('click', handleInteract)
    window.addEventListener('keydown', handleInteract)
    window.addEventListener('touchstart', handleInteract)

    return () => {
      window.removeEventListener('click', handleInteract)
      window.removeEventListener('keydown', handleInteract)
      window.removeEventListener('touchstart', handleInteract)
      // Cleanup audio?
      // Usually good to close context but for bg music we react to prop.
    }
  }, [])

  useEffect(() => {
    if (gainNode.current) {
      // Smooth transition
      gainNode.current.gain.setTargetAtTime(enabled ? 0.3 : 0, audioCtx.current!.currentTime, 0.5)
    }
  }, [enabled])

  return null
}
