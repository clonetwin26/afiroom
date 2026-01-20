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

    // Bass Pulse (16th notes)
    // Bass Pulse REMOVED


    // Arpeggiator Loop
    // Notes: A minor pentatonic ish (A, C, D, E, G)
    const notes = [440, 523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25]
    let noteIdx = 0
    let nextNoteTime = ctx.currentTime

    const scheduler = () => {
      // Lookahead
      while (nextNoteTime < ctx.currentTime + 0.1) {
        // Play note
        const osc = ctx.createOscillator()
        osc.type = 'square'
        osc.frequency.value = notes[noteIdx % notes.length]

        const g = ctx.createGain()
        g.gain.setValueAtTime(0.05, nextNoteTime)
        g.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + 0.1) // Short staccato

        osc.connect(g)
        g.connect(masterGain)

        osc.start(nextNoteTime)
        osc.stop(nextNoteTime + 0.1)

        // Advance
        nextNoteTime += 0.11 // fast 16ths roughly
        noteIdx++
      }
      // Keep loop running if enabled (we rely on master gain to mute, but loop keeps scheduling)
      // Ideally we stop scheduling if disabled to save CPU, but react effect re-mounts on enable toggle? 
      // No, props change. Let's keep it simple: relying on Master Gain mute.
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
