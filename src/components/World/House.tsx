import { Plane, useTexture } from '@react-three/drei'
import { Furniture } from './Furniture'
import { useGameStore } from '../../store/gameStore'
import * as THREE from 'three'

const WallWithDoor = ({ position, rotation, texture, color }: { position: [number, number, number], rotation: [number, number, number], texture: THREE.Texture, color: string }) => {
  // Nudge wall inward slightly to avoid overlap
  return (
    <group position={position} rotation={rotation}>
      {/* Left Panel - Height 8, Position y=4 to span 0-8 */}
      <Plane position={[-3, 4, 0]} args={[4, 8]}>
        <meshStandardMaterial map={texture} color={color} side={THREE.DoubleSide} />
      </Plane>
      {/* Right Panel - Height 8, Position y=4 to span 0-8 */}
      <Plane position={[3, 4, 0]} args={[4, 8]}>
        <meshStandardMaterial map={texture} color={color} side={THREE.DoubleSide} />
      </Plane>
      {/* Top Panel (Above Door) - Door is 4 high. Gap is 2 width. From 4 to 8 is 4 units. */}
      {/* Center of 4-8 is 6. Height is 4. */}
      <Plane position={[0, 6, 0]} args={[2, 4]}>
        <meshStandardMaterial map={texture} color={color} side={THREE.DoubleSide} />
      </Plane>
    </group>
  )
}

const Room = ({ position, type, color }: { position: [number, number, number], type: string, color: string }) => {
  // Load room textures (using existing for now as placeholders for new types to avoid error until generated)
  const textures = useTexture({
    wood: 'textures/floor_wood_1768925349740.png',
    tile: 'textures/floor_tile_1768925365399.png',
    wallpaper: 'textures/wall_wallpaper_1768925379995.png'
  })

  textures.wood.wrapS = textures.wood.wrapT = THREE.RepeatWrapping
  textures.tile.wrapS = textures.tile.wrapT = THREE.RepeatWrapping
  textures.wallpaper.wrapS = textures.wallpaper.wrapT = THREE.RepeatWrapping

  textures.wood.repeat.set(4, 4)
  textures.tile.repeat.set(4, 4)
  textures.wallpaper.repeat.set(4, 2)

  const isTiled = type === 'kitchen' || type === 'bathroom'
  // Special floors for new types if we had them

  return (
    <group position={position}>
      {/* Floor */}
      <Plane rotation={[-Math.PI / 2, 0, 0]} args={[10, 10]} receiveShadow>
        <meshStandardMaterial map={isTiled ? textures.tile : textures.wood} />
      </Plane>
      {/* Ceiling - Raised to y=8 */}
      <Plane rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]} args={[10, 10]}>
        <meshStandardMaterial color="#ddd" side={THREE.DoubleSide} />
      </Plane>

      {/* Room Light REMOVED for performance */}
      {/* <pointLight position={[0, 3.8, 0]} intensity={1.2} distance={20} decay={1.5} color="#fffcf5" /> */}

      {/* Walls with Doorways */}

      {/* Walls with Doorways */}
      {/* Using 4.98 offset to stay just inside 5.0 line to avoid z-fighting */}
      <WallWithDoor position={[0, 0, -4.98]} rotation={[0, 0, 0]} texture={textures.wallpaper} color={color} />
      <WallWithDoor position={[0, 0, 4.98]} rotation={[0, Math.PI, 0]} texture={textures.wallpaper} color={color} />
      <WallWithDoor position={[-4.98, 0, 0]} rotation={[0, Math.PI / 2, 0]} texture={textures.wallpaper} color={color} />
      <WallWithDoor position={[4.98, 0, 0]} rotation={[0, -Math.PI / 2, 0]} texture={textures.wallpaper} color={color} />
    </group>
  )
}

const Roof = () => {
  // Calculate bounding box of the house
  const gridSize = useGameStore(state => state.gridSize)
  const size = gridSize * 10

  return (
    <group position={[0, 10, 0]}>
      {/* 
        Simple Pyramid Roof 
        Height: 6 units
        Base: size * 0.8
        Raised to y=10 to clear the y=8 ceiling clearly.
      */}
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={false} receiveShadow>
        <coneGeometry args={[size * 0.8, 6, 4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  )
}

export const House = () => {
  const rooms = useGameStore(state => state.rooms)
  const furniture = useGameStore(state => state.furniture)

  if (!rooms || rooms.length === 0) return null

  return (
    <group>
      <Roof />
      {rooms.map(room => (
        <Room key={room.id} position={room.position} type={room.type} color={room.color} />
      ))}
      {furniture.map(item => (
        <Furniture key={item.id} item={item} />
      ))}
    </group>
  )
}

