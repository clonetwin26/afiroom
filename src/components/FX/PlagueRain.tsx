import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore'

const COUNT = 200 // 50 frogs, 50 locusts, 100 blood droplets

export const PlagueRain = () => {
  const gameState = useGameStore(state => state.gameState)
  const rooms = useGameStore(state => state.rooms)

  const [isRaining, setIsRaining] = useState(false)

  // Every 60 seconds, rain for 7 seconds (Starts at 30 seconds)
  useEffect(() => {
    const cycle = () => {
      setIsRaining(true)
      setTimeout(() => setIsRaining(false), 7000) // Rain for 7 seconds
    }

    let intervalId: any

    const startTimeout = setTimeout(() => {
      cycle()
      intervalId = setInterval(cycle, 60000)
    }, 30000) // First run at 30 seconds

    return () => {
      clearTimeout(startTimeout)
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  // Create Canvas Texture for Frog
  const frogTex = useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background Transparent
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillRect(0, 0, 64, 64)

    // Frog Silhouette
    ctx.fillStyle = '#4CAF50'
    ctx.beginPath()
    ctx.arc(32, 32, 12, 0, Math.PI * 2) // Body
    ctx.fill()

    // Eyes
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.arc(22, 22, 5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(42, 22, 5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'black'
    ctx.beginPath(); ctx.arc(22, 22, 2, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(42, 22, 2, 0, Math.PI * 2); ctx.fill()

    // Legs
    ctx.strokeStyle = '#388E3C'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(20, 40); ctx.lineTo(10, 50); ctx.lineTo(20, 60); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(44, 40); ctx.lineTo(54, 50); ctx.lineTo(44, 60); ctx.stroke()

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  // Create Canvas Texture for Locust
  const locustTex = useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 128 // Long
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background Transparent
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillRect(0, 0, 64, 128)

    // Locust Silhouette
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(24, 32, 16, 64) // Body
    
    // Head
    ctx.fillStyle = '#5C4033'
    ctx.fillRect(20, 16, 24, 16)

    // Wings
    ctx.fillStyle = 'rgba(245, 222, 179, 0.6)'
    ctx.beginPath()
    ctx.moveTo(32, 48); ctx.lineTo(12, 112); ctx.lineTo(32, 112); ctx.fill()
    ctx.beginPath()
    ctx.moveTo(32, 48); ctx.lineTo(52, 112); ctx.lineTo(32, 112); ctx.fill()

    // Antennae
    ctx.strokeStyle = '#2F4F4F'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(25, 16); ctx.lineTo(15, 0); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(39, 16); ctx.lineTo(49, 0); ctx.stroke()

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  // Particle positions
  const particles = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      let type: 'frog' | 'locust' | 'blood' = 'blood'
      if (i < 50) type = 'frog'
      else if (i < 100) type = 'locust'
      
      // Random room position base
      const room = rooms[Math.floor(Math.random() * rooms.length)]
      const rx = room ? room.position[0] : 0
      const rz = room ? room.position[2] : 0

      const speedMult = type === 'blood' ? 2.5 : 1.0 // Blood falls faster!

      return {
        id: i,
        type,
        base: [rx, rz],
        x: (Math.random() - 0.5) * 8, // inside room
        z: (Math.random() - 0.5) * 8,
        y: 8 + Math.random() * 4, // Start height above ceiling or near it
        speed: (1.5 + Math.random() * 2) * speedMult,
        active: false,
        sway: Math.random() * Math.PI * 2
      }
    })
  }, [rooms])

  const meshRefFrog = useRef<THREE.InstancedMesh>(null!)
  const meshRefLocust = useRef<THREE.InstancedMesh>(null!)
  const meshRefBlood = useRef<THREE.InstancedMesh>(null!)

  useFrame((_, delta) => {
    if (!isRaining && particles.filter(p => p.active).length === 0) return

    particles.forEach(p => {
      if (isRaining && !p.active) {
        // Activate if raining
        p.active = true
        p.y = 8 + Math.random() * 4
        p.sway = Math.random() * Math.PI * 2
      }

      if (p.active) {
        p.y -= p.speed * delta
        p.sway += delta * 2
        p.x += Math.sin(p.sway) * 0.1 * delta // Slight drift

        if (p.y <= 0) {
          p.active = false // Hit ground -> disappear
          p.y = -10 // Hide it
        }
      }
    })

    // Update instances
    let frogIdx = 0
    let locustIdx = 0
    let bloodIdx = 0

    const dummy = new THREE.Object3D()

    particles.forEach(p => {
      dummy.position.set(p.base[0] + p.x, p.y, p.base[1] + p.z)
      dummy.rotation.set(0, 0, 0) // No rotation for flat planes billboard style or fixed style

      if (p.type === 'frog' && meshRefFrog.current) {
        dummy.scale.set(0.5, 0.5, 0.5)
        dummy.updateMatrix()
        meshRefFrog.current.setMatrixAt(frogIdx++, dummy.matrix)
      } else if (p.type === 'locust' && meshRefLocust.current) {
        dummy.scale.set(0.5, 1.0, 0.5) // Locust is taller/longer
        dummy.updateMatrix()
        meshRefLocust.current.setMatrixAt(locustIdx++, dummy.matrix)
      } else if (p.type === 'blood' && meshRefBlood.current) {
        dummy.scale.set(0.1, 1.5, 0.1) // Tall & skinny streaky red droplet
        dummy.updateMatrix()
        meshRefBlood.current.setMatrixAt(bloodIdx++, dummy.matrix)
      }
    })

    if (meshRefFrog.current) meshRefFrog.current.instanceMatrix.needsUpdate = true
    if (meshRefLocust.current) meshRefLocust.current.instanceMatrix.needsUpdate = true
    if (meshRefBlood.current) meshRefBlood.current.instanceMatrix.needsUpdate = true
  })

  // We can't use Instances from drei for custom InstancedMesh manual updates easily without children `Instance`. 
  // Let's use three.js raw `<instancedMesh>` to do manual imperative updates since we want to animate 100 particles!
  // It is much faster to loop in JS and update matrix buffer than render 100 React components!

  if (gameState !== 'playing') return null

  return (
    <group>
      {/* Frogs */}
      <instancedMesh ref={meshRefFrog} args={[null!, null!, COUNT / 2]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial side={THREE.DoubleSide} map={frogTex} transparent={true} />
      </instancedMesh>

      {/* Locusts */}
      <instancedMesh ref={meshRefLocust} args={[null!, null!, 50]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial side={THREE.DoubleSide} map={locustTex} transparent={true} />
      </instancedMesh>

      {/* Blood Streaks */}
      <instancedMesh ref={meshRefBlood} args={[null!, null!, 100]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial side={THREE.DoubleSide} color="#B22222" transparent opacity={0.8} />
      </instancedMesh>
    </group>
  )
}
