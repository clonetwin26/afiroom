import { useRef, useEffect, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { Vector3 } from 'three'
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
    // Rooms are 10x10.
    // Center of grid is 0,0.
    // Range is -(gridSize * 10)/2 to (gridSize * 10)/2
    // e.g. Size 5 => 50 units total. Range -25 to 25.
    const mapSize = useGameStore.getState().gridSize * 10
    const limit = (mapSize / 2) - 0.5 // Keep slightly inside

    if (Math.abs(pos.x) > limit || Math.abs(pos.z) > limit) return true

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
      // Sensitivity
      const sens = 0.005
      camera.rotation.y -= lookInput.x * sens
      // Clamp pitch? camera.rotation.x is pitch?
      // Basic FPS camera usually rotates Y on World axis, and X on local axis.
      // For simple ThreeJS camera:
      // camera.rotation.order = 'YXZ' usually.
      // Let's just do simple Y rotation for now to turn around.

      // Reset delta in store? 
      // No, the TouchLook component sends delta per move event.
      // But useFrame runs 60fps.
      // If TouchLook sets state, it persists until next move?
      // TouchLook implementation updates store with delta.
      // We should consume it and clear it?
      // Actually, store update is React state.
      // Better: TouchLook should probably write to a ref or we consume and zero it out?
      // Or simpler: TouchLook just tracks movement and we read it.

      // Issue: if user stops moving finger but keeps it down, delta is 0.
      // TouchLook component sends dx/dy.
      // If we read it here, we apply it.
      // But if we don't clear it, we might re-apply it next frame if store didn't update?
      // Attempting to consume directly from store state might be laggy.

      // BETTER: direct ref usage or modify camera inside TouchLook?
      // Since TouchLook is UI, it doesn't have access to camera easily (unless we use Drei hooks in UI? No, UI is outside Canvas).

      // Fine: We read store.
      // We need to make sure we don't apply the same delta twice.
      // But `lookInput` in store is "current delta".
      // TouchLook updates it on `touchmove`.
      // If `touchmove` doesn't fire (finger still), delta is 0 (handled by handleMove logic if we tracked it right? No).
      // My TouchLook `handleMove` sets state.
      // If `touchmove` stops firing, store state stays at last delta?
      // YES. That would cause "drift" (continuous spinning).

      // Fix: TouchLook should reset delta after frame?
      // Hard to sync.

      // Alternative: TouchLook sets "rotation velocity" or "target rotation"?
      // No.

      // Quick Fix: In Player.tsx, we read it, apply it, and... we can't clear store state easily in useFrame loop without re-triggering stuff.
      // PROPER FIX: TouchLook should NOT put delta in Store State.
      // It should put it in a Mutable Ref in the Store (zustand transient update)?
      // OR `useGameStore.getState().lookInput` is just read, and we assume it's "velocity"?
      // If it's drag-to-look, it's not velocity. It's absolute positional delta.

      // Let's change TouchLook to simply drive `camera.rotation`?
      // But TouchLook is outside Canvas (in UI). It can't see `camera`.

      // OK, Plan B:
      // Add `rotation` to GameStore (global camera rotation target)? No.
      // Let's use `lookVelocity` in store.
      // If finger moves, we set velocity. If stops, velocity 0.
      // `touchmove` gives position.
      // Delta = pos - lastPos.
      // If we treat Delta as "amount to rotate this frame"?
      // We need to set it to 0 after consuming.

      useGameStore.getState().setLookInput({ x: 0, y: 0 })
    }
  })

  // Ensure pointer unlocks when not playing
  useEffect(() => {
    if (gameState !== 'playing') {
      document.exitPointerLock()
    }
  }, [gameState])

  // Reset position ONLY when a new map is generated (when rooms reference changes)
  // This effectively handles "Start Game" vs "Resume" automatically,
  // because "Resume" does not regenerate rooms.
  const rooms = useGameStore(state => state.rooms)
  useEffect(() => {
    if (rooms.length > 0) {
      // Reset to center
      camera.position.set(0, 1.7, 0)
      camera.lookAt(0, 1.7, -10)
    }
  }, [rooms, camera])

  // Render controls only when playing
  return (
    <>
      {gameState === 'playing' && <PointerLockControls />}
    </>
  )
}
