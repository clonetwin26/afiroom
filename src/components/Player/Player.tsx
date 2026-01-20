import { useRef, useEffect, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PointerLockControls, DeviceOrientationControls } from '@react-three/drei'
import { Vector3 } from 'three'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore'

export const Player = () => {
  const { camera } = useThree()
  const gameState = useGameStore(state => state.gameState)

  const [moveForward, setMoveForward] = useState(false)
  const [moveBackward, setMoveBackward] = useState(false)
  const [moveLeft, setMoveLeft] = useState(false)
  const [moveRight, setMoveRight] = useState(false)

  const direction = useRef(new Vector3())
  const joystick = useGameStore(state => state.joystickInput) || { x: 0, y: 0 }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': setMoveForward(true); break
        case 'ArrowLeft':
        case 'KeyA': setMoveLeft(true); break
        case 'ArrowDown':
        case 'KeyS': setMoveBackward(true); break
        case 'ArrowRight':
        case 'KeyD': setMoveRight(true); break
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': setMoveForward(false); break
        case 'ArrowLeft':
        case 'KeyA': setMoveLeft(false); break
        case 'ArrowDown':
        case 'KeyS': setMoveBackward(false); break
        case 'ArrowRight':
        case 'KeyD': setMoveRight(false); break
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  const checkCollision = (pos: Vector3) => {
    // 1. Map Boundaries
    const { gridSize } = useGameStore.getState()
    const spacing = 10
    const centerIndex = Math.floor(gridSize / 2)

    // Calculate actual bounds of the generated rooms
    const minX = (0 - centerIndex) * spacing - 5 + 0.5
    const maxX = (gridSize - 1 - centerIndex) * spacing + 5 - 0.5
    const minZ = minX // Square grid
    const maxZ = maxX

    if (pos.x < minX || pos.x > maxX || pos.z < minZ || pos.z > maxZ) return true

    // 2. Interior Walls
    // Rooms are centered at 0, 10, -10, etc.
    // Walls are at +/- 5 from room centers.
    // This effectively means walls are at 5, 15, -5, -15...
    // i.e. (coordinate + 5) % 10 == 0? 
    // Easier: Relative position in current 10x10 cell.

    const roomX = Math.round(pos.x / 10) * 10
    const roomZ = Math.round(pos.z / 10) * 10

    const rx = pos.x - roomX
    const rz = pos.z - roomZ

    // Wall check threshold (Wall is at +/- 5)
    // Player radius approx 0.5. So if > 4.5 from center, we touch wall.
    const wallDist = 4.2 // allow getting close-ish

    // Door gap width is 2 (-1 to 1). 
    // So if clean line of sight (abs(other_axis) < 1), we can pass.
    const doorHalfWidth = 0.8 // slightly tighter than 1.0 to avoid clipping edge

    // Checking Z-Walls (North/South of room)
    if (Math.abs(rz) > wallDist) {
      // We are hitting a Z-wall. Are we in the X-doorway?
      if (Math.abs(rx) > doorHalfWidth) return true
    }

    // Checking X-Walls (East/West of room)
    if (Math.abs(rx) > wallDist) {
      // We are hitting an X-wall. Are we in the Z-doorway?
      if (Math.abs(rz) > doorHalfWidth) return true
    }

    return false
  }

  useFrame((_, delta) => {
    // Only move if playing
    if (gameState !== 'playing') return

    const speed = 10 * delta
    direction.current.set(0, 0, 0)

    if (moveForward) direction.current.z -= speed
    if (moveBackward) direction.current.z += speed
    if (moveLeft) direction.current.x -= speed
    if (moveRight) direction.current.x += speed

    // Joystick Input
    if (joystick.x !== 0 || joystick.y !== 0) {
      direction.current.x += joystick.x * speed
      direction.current.z += joystick.y * speed
    }

    if (direction.current.length() > 0) {
      const camDir = new Vector3()
      camera.getWorldDirection(camDir)
      camDir.y = 0
      camDir.normalize()

      const camRight = new Vector3()
      camRight.crossVectors(camDir, new Vector3(0, 1, 0)).normalize()

      const nextPos = camera.position.clone()

      // Calculate movement vector in world space
      // Forward/Back uses camDir
      // Left/Right uses camRight
      // We must decompose direction.current (which is local input) into world movement
      // Actually, simple way:
      // z is forward/back, x is left/right

      const moveVec = new Vector3()
      moveVec.addScaledVector(camDir, -direction.current.z) // -z is forward in my logic above? 
      // Wait, standard THREE controls:
      // forward key set z -= speed.
      // So -z is forward.

      moveVec.addScaledVector(camRight, direction.current.x) // +x is right

      nextPos.add(moveVec)

      if (!checkCollision(nextPos)) {
        camera.position.x = nextPos.x
        camera.position.z = nextPos.z
      }
    }

    // Touch Look Rotation
    const lookInput = useGameStore.getState().lookInput
    
    if (lookInput && (lookInput.x !== 0 || lookInput.y !== 0)) {
       const sens = 0.005
       camera.rotation.order = 'YXZ'
       camera.rotation.y -= lookInput.x * sens
       camera.rotation.x -= lookInput.y * sens // Inverted Pitch: Up swipes look Down
       
       const maxPitch = Math.PI / 2 - 0.1
       camera.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, camera.rotation.x))
       
       camera.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, camera.rotation.x))
       
       useGameStore.getState().setLookInput({ x: 0, y: 0 })
    }

    // 3. Raycast for Interaction (Reticle)
    // We raycast from center of screen (0, 0)
    raycaster.current.setFromCamera({ x: 0, y: 0 } as any, camera)
    // Intersect with scene children - optimize by tagging?
    // We'll traverse or just check specific layer? 
    // Checking ALL scene objects is heavy.
    // Ideally we have a list of interactables.
    // Furniture items are in the scene.
    // Let's use `scene.children` but filter?
    // Actually, R3F's `raycaster` is usually shared.
    // Let's use a ref for Raycaster.
    
    const intersects = raycaster.current.intersectObjects(scene.children, true)
    
    let foundId: string | null = null
    
    // Find first with furnitureId
    for (let i = 0; i < intersects.length; i++) {
        const obj = intersects[i].object
        // Check up the tree for userData.furnitureId
        let curr: any = obj
        while (curr) {
            if (curr.userData && curr.userData.furnitureId) {
                foundId = curr.userData.furnitureId
                break
            }
            curr = curr.parent
        }
        if (foundId) break
        // Stop if we hit a wall? Wall should block?
        // If we hit a wall (Mesh) before furniture, we should stop if wall is opaque.
        // Assuming walls are meshes without furnitureId.
        if (!foundId && obj.type === 'Mesh') {
             // If closer than furniture, it blocks.
             // We continue to next intersection? 
             // intersects are sorted by distance.
             // So if first hit is wall, we stop.
             break 
        }
    }
    
    const currentHover = useGameStore.getState().hoveredId
    if (foundId !== currentHover) {
        useGameStore.getState().setHoveredId(foundId)
    }
  })

  // Global Interaction Handler
  useEffect(() => {
    const handleInteract = () => {
        const { hoveredId, gameState, furniture } = useGameStore.getState()
        if (gameState !== 'playing' || !hoveredId) return
        
        // Find item
        const item = furniture.find(f => f.id === hoveredId)
        if (!item) return

        // Distance Check
        const dist = camera.position.distanceTo(new Vector3(...item.position))
        if (dist > 6) {
            useGameStore.getState().showNotification('Too Far!')
            return 
        }

        // Logic from Furniture.tsx
        const isSearchable = item.type !== 'safe' && item.type !== 'dumbbell' && item.type !== 'monitor' && item.type !== 'rug'
        
        if (item.type === 'safe') {
            useGameStore.getState().setGameState('safe_interaction')
        } else if (isSearchable) {
            useGameStore.getState().searchLocation(item.id)
        }
    }

    window.addEventListener('click', handleInteract)
    
    return () => {
      window.removeEventListener('click', handleInteract)
    }
  }, [camera])

  const raycaster = useRef(new THREE.Raycaster())
  const { scene } = useThree()
  const isGyroEnabled = useGameStore(state => state.isGyroEnabled)


  // Ensure pointer unlocks when not playing
  useEffect(() => {
    if (gameState !== 'playing') {
      document.exitPointerLock?.()
    }
  }, [gameState])

  // Reset position ONLY when a new map is generated (when rooms reference changes)
  const rooms = useGameStore(state => state.rooms)
  useEffect(() => {
    if (rooms.length > 0) {
      // Reset to center
      camera.position.set(0, 1.7, 0)
      camera.lookAt(0, 1.7, -10)
    }
  }, [rooms, camera])

  // NOTE: If Gyro is enabled, we use DeviceOrientationControls instead of pointer lock or swipe look.
  // DeviceOrientationControls handles rotation automatically.
  // We should prevent manual rotation logic from fighting it if enabled.
  
  // Actually, we can just NOT render Look logic if Gyro is on?
  // But wait, the standard DeviceOrientationControls from Drei might set rotation directly.
  // Let's modify the useFrame loop to skip manual rotation if gyro is enabled.

  // Render controls only when playing
  // Also render DeviceOrientationControls if enabled
  return (
    <>
      {gameState === 'playing' && <PointerLockControls />}
      {gameState === 'playing' && isGyroEnabled && <DeviceOrientationControls />}
    </>
  )
}
