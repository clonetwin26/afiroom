import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'

export const Confetti = ({ count = 50, position }: { count?: number, position: [number, number, number] }) => {
  // Simple explosion of particles
  const particles = Array.from({ length: count }, () => ({
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 5,
      Math.random() * 5 + 2,
      (Math.random() - 0.5) * 5
    ),
    color: new THREE.Color().setHSL(Math.random(), 1, 0.5)
  }))

  return (
    <Instances range={count}>
      <planeGeometry args={[0.1, 0.1]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
      {particles.map((data, i) => (
        <ConfettiParticle key={i} {...data} initialPos={position} />
      ))}
    </Instances>
  )
}

const ConfettiParticle = ({ velocity, color, initialPos }: any) => {
  const ref = useRef<any>(null)
  const pos = useRef(new THREE.Vector3(...initialPos))
  const vel = useRef(velocity.clone())

  useFrame((state, delta) => {
    if (!ref.current) return
    vel.current.y -= 9.8 * delta // Gravity
    pos.current.addScaledVector(vel.current, delta)
    ref.current.position.copy(pos.current)
    ref.current.rotation.x += delta * 2
    ref.current.rotation.y += delta * 3
    ref.current.scale.setScalar(Math.max(0, 1 - state.clock.elapsedTime / 3)) // Fade out size? No, just shrinking logic if needed.
    // Actually just let them fall through floor for now or stop.
    if (pos.current.y < 0) {
      vel.current.set(0, 0, 0) // Stop on floor
      pos.current.y = 0.01
    }
  })

  return <Instance ref={ref} color={color} position={initialPos} />
}

export const ConfettiRain = ({ count = 100 }: { count?: number }) => {
  // Continuous rain falling from top
  const particles = Array.from({ length: count }, () => ({
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      -(Math.random() * 5 + 2), // Downward
      (Math.random() - 0.5) * 2
    ),
    color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
    initialPos: [
      (Math.random() - 0.5) * 20,
      10 + Math.random() * 10,
      (Math.random() - 0.5) * 20
    ] as [number, number, number]
  }))

  const moneyTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Bill Green
    ctx.fillStyle = '#85bb65'
    ctx.fillRect(0, 0, 64, 128)

    // Border
    ctx.strokeStyle = '#2d5a27'
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, 60, 124)

    // Oval Center
    ctx.fillStyle = '#2d5a27'
    ctx.beginPath()
    ctx.ellipse(32, 64, 25, 15, 0, 0, Math.PI * 2)
    ctx.fill()

    // $ Symbol
    ctx.fillStyle = '#85bb65'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('$', 32, 64)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  return (
    <Instances range={count}>
      <planeGeometry args={[0.2, 0.4]} />
      <meshBasicMaterial side={THREE.DoubleSide} map={moneyTexture} transparent />
      {particles.map((data, i) => (
        <RainParticle key={i} {...data} />
      ))}
    </Instances>
  )
}

const RainParticle = ({ velocity, initialPos }: any) => {
  const ref = useRef<any>(null)
  const pos = useRef(new THREE.Vector3(...initialPos))

  useFrame((_, delta) => {
    if (!ref.current) return
    pos.current.addScaledVector(velocity, delta)

    ref.current.rotation.x += delta * 2
    ref.current.rotation.y += delta * 3

    if (pos.current.y < 0) {
      // Reset to top
      pos.current.y = 10 + Math.random() * 5
      pos.current.x = (Math.random() - 0.5) * 20
      pos.current.z = (Math.random() - 0.5) * 20
    }
    ref.current.position.copy(pos.current)
  })

  return <Instance ref={ref} position={initialPos} />
}
