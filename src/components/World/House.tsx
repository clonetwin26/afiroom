import { Instances, Instance, useTexture } from '@react-three/drei'
import { Furniture } from './Furniture'
import { useGameStore } from '../../store/gameStore'
import * as THREE from 'three'
import { useMemo } from 'react'

const WallInstances = ({ rooms, textures }: { rooms: any[], textures: any }) => {
// WallWithDoor consists of 3 parts: Left (-3, 4, 0), Right (3, 4, 0), Top (0, 6, 0) relative to wall center
// Wall center is offset from room center.

  // We need to generate all the transforms for all 4 walls of all rooms.
  // Each "Wall" has 3 components.
  // We can just instance the 3 shapes globally!

  // Geometries
  const leftPanelGeo = useMemo(() => new THREE.PlaneGeometry(4, 8), [])
  const topPanelGeo = useMemo(() => new THREE.PlaneGeometry(2, 4), [])

  // Material - Shared Wallpaper
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ map: textures.wallpaper, side: THREE.DoubleSide })
    return mat
  }, [textures.wallpaper])

  // Helper to generate transforms for a single wall

  // We need 3 separate Instances components because geometries differ?
  // Actually, Left and Right are same size (4x8). Top is different (2x4).
  // So 2 Groups: "SidePanels" and "TopPanels".

  return (
    <>
      {/* Side Panels (4x8) - Left and Right */}
      <Instances range={rooms.length * 4 * 2} material={material} geometry={leftPanelGeo}>
        {rooms.map((room: any) => (
          <group key={room.id} position={room.position}>
            {/* 4 Walls per room */}
            {/* Back Wall (-z) */}
            <group position={[0, 0, -4.98]} rotation={[0, 0, 0]}>
              <Instance position={[-3, 4, 0]} color={room.color} />
              <Instance position={[3, 4, 0]} color={room.color} />
            </group>
            {/* Front Wall (+z) */}
            <group position={[0, 0, 4.98]} rotation={[0, Math.PI, 0]}>
              <Instance position={[-3, 4, 0]} color={room.color} />
              <Instance position={[3, 4, 0]} color={room.color} />
            </group>
            {/* Left Wall (-x) */}
            <group position={[-4.98, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <Instance position={[-3, 4, 0]} color={room.color} />
              <Instance position={[3, 4, 0]} color={room.color} />
            </group>
            {/* Right Wall (+x) */}
            <group position={[4.98, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <Instance position={[-3, 4, 0]} color={room.color} />
              <Instance position={[3, 4, 0]} color={room.color} />
            </group>
          </group>
        ))}
      </Instances>

      {/* Top Panels (2x4) - Above Door */}
      <Instances range={rooms.length * 4} material={material} geometry={topPanelGeo}>
        {rooms.map((room: any) => (
          <group key={room.id} position={room.position}>
            <Instance position={[0, 6, -4.98]} rotation={[0, 0, 0]} color={room.color} />
            <Instance position={[0, 6, 4.98]} rotation={[0, Math.PI, 0]} color={room.color} />
            <Instance position={[-4.98, 6, 0]} rotation={[0, Math.PI / 2, 0]} color={room.color} />
            <Instance position={[4.98, 6, 0]} rotation={[0, -Math.PI / 2, 0]} color={room.color} />
          </group>
        ))}
      </Instances>
    </>
  )
}

const Roof = () => {
// Keep single mesh for now, it's just one object.
  const gridSize = useGameStore(state => state.gridSize)
  const size = gridSize * 10
  const spacing = 10
  const centerIndex = Math.floor(gridSize / 2)
  const minX = (0 - centerIndex) * spacing - 5
  const maxX = (gridSize - 1 - centerIndex) * spacing + 5
  const centerPos = (minX + maxX) / 2

  return (
    <group position={[centerPos, 10, centerPos]}>
      <mesh rotation={[0, Math.PI / 4, 0]} receiveShadow>
        <coneGeometry args={[size * 0.8, 6, 4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  )
}

export const House = () => {
  const rooms = useGameStore(state => state.rooms)
  const furniture = useGameStore(state => state.furniture)

  const textures = useTexture({
    wood: 'textures/wood_floor_texture_new.png',
    tile: 'textures/floor_tile_1768925365399.png',
    wallpaper: 'textures/wall_wallpaper_1768925379995.png',
    furnitureWood: 'textures/furniture_wood_1768925398400.png',
    furnitureFabric: 'textures/furniture_fabric_1768925469911.png',
    furnitureMetal: 'textures/metal_texture_1768925485596.png',
    painting: 'textures/painting_abstract.png',
    rug: 'textures/rug_persian.png',
    woodMahogany: 'textures/wood_mahogany.png',
    woodOak: 'textures/wood_oak.png',
    woodRustic: 'textures/wood_rustic.png',
    books: 'textures/bookshelf_books.png',
    paintingPassover: 'textures/painting_passover.png'
  })

  // Configure textures
  textures.wood.wrapS = textures.wood.wrapT = THREE.RepeatWrapping
  textures.tile.wrapS = textures.tile.wrapT = THREE.RepeatWrapping
  textures.wallpaper.wrapS = textures.wallpaper.wrapT = THREE.RepeatWrapping
  textures.woodMahogany.wrapS = textures.woodMahogany.wrapT = THREE.RepeatWrapping
  textures.woodOak.wrapS = textures.woodOak.wrapT = THREE.RepeatWrapping
  textures.woodRustic.wrapS = textures.woodRustic.wrapT = THREE.RepeatWrapping
  textures.books.wrapS = textures.books.wrapT = THREE.RepeatWrapping
  textures.books.repeat.set(2, 1) // 2x1 repeat for books

  textures.wood.repeat.set(4, 4)
  textures.tile.repeat.set(4, 4)
  textures.wallpaper.repeat.set(4, 2)
  textures.woodMahogany.repeat.set(2, 2)
  textures.woodOak.repeat.set(2, 2)
  textures.woodRustic.repeat.set(2, 2)

  const furnitureTextures = {
    wood: textures.furnitureWood,
    woodMahogany: textures.woodMahogany,
    woodOak: textures.woodOak,
    woodRustic: textures.woodRustic,
    fabric: textures.furnitureFabric,
    metal: textures.furnitureMetal,
    painting: textures.painting,
    paintingPassover: textures.paintingPassover,
    rug: textures.rug,
    books: textures.books
  }

  const floorGeo = useMemo(() => new THREE.PlaneGeometry(10, 10), [])
  const woodRooms = useMemo(() => rooms.filter((r: any) => r.type !== 'kitchen' && r.type !== 'bathroom'), [rooms])
  const tileRooms = useMemo(() => rooms.filter((r: any) => r.type === 'kitchen' || r.type === 'bathroom'), [rooms])

  if (!rooms || rooms.length === 0) return null

  return (
    <group>
      <Roof />

      {/* Instanced Floors - Wood */}
      <Instances range={woodRooms.length} material={new THREE.MeshStandardMaterial({ map: textures.wood })} geometry={floorGeo}>
        {woodRooms.map((room: any) => (
          <Instance key={room.id} position={room.position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow />
        ))}
      </Instances>

      {/* Instanced Floors - Tile */}
      <Instances range={tileRooms.length} material={new THREE.MeshStandardMaterial({ map: textures.tile })} geometry={floorGeo}>
        {tileRooms.map((room: any) => (
          <Instance key={room.id} position={room.position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow />
        ))}
      </Instances>

      {/* Instanced Ceilings */}
      <Instances range={rooms.length} material={new THREE.MeshStandardMaterial({ color: '#ddd', side: THREE.DoubleSide })} geometry={floorGeo}>
        {rooms.map((room: any) => (
          <Instance key={room.id} position={[room.position[0], 8, room.position[2]]} rotation={[Math.PI / 2, 0, 0]} />
        ))}
      </Instances>

      {/* Instanced Walls */}
      <WallInstances rooms={rooms} textures={textures} />

      {/* Furniture is NOT instanced yet, but logic is separate */}
      {furniture.map(item => (
        <Furniture key={item.id} item={item} textures={furnitureTextures} />
      ))}
    </group>
  )
}
