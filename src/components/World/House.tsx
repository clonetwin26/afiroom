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


  const createShabbatTexture = () => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background - Dark Blue/Warm
    const grad = ctx.createLinearGradient(0, 0, 0, 512)
    grad.addColorStop(0, '#1a0b00')
    grad.addColorStop(1, '#4a2c00')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 512, 512)

    // Table
    ctx.fillStyle = '#8b4513'
    ctx.fillRect(50, 400, 412, 112)

    // Candles (Left)
    ctx.fillStyle = '#silver'
    ctx.fillRect(150, 300, 40, 100) // Stick
    ctx.fillStyle = 'rgba(255, 255, 0, 0.8)' // Flame glow
    ctx.beginPath(); ctx.arc(170, 280, 25, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fff' // Flame Core
    ctx.beginPath(); ctx.arc(170, 285, 10, 0, Math.PI * 2); ctx.fill()

    // Candles (Right)
    ctx.fillStyle = '#silver'
    ctx.fillRect(320, 300, 40, 100) // Stick
    ctx.fillStyle = 'rgba(255, 255, 0, 0.8)' // Flame glow
    ctx.beginPath(); ctx.arc(340, 280, 25, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fff' // Flame Core
    ctx.beginPath(); ctx.arc(340, 285, 10, 0, Math.PI * 2); ctx.fill()

    // Challah (Center)
    ctx.fillStyle = '#d2691e'
    ctx.beginPath()
    ctx.ellipse(255, 410, 80, 40, 0, 0, Math.PI * 2)
    ctx.fill()
    // Braids
    ctx.strokeStyle = '#8b4500'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(190, 410); ctx.quadraticCurveTo(255, 380, 320, 410); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(190, 410); ctx.quadraticCurveTo(255, 440, 320, 410); ctx.stroke();

    return new THREE.CanvasTexture(canvas)
  }

  const createMenorahTexture = () => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background - Dark
    ctx.fillStyle = '#101020'; ctx.fillRect(0, 0, 512, 512);

    // Base
    ctx.fillStyle = '#ffd700'; // Gold
    ctx.fillRect(240, 400, 32, 50);
    ctx.beginPath(); ctx.moveTo(200, 450); ctx.lineTo(312, 450); ctx.lineTo(256, 400); ctx.fill();

    // Stem
    ctx.fillRect(250, 200, 12, 200);

    // Branches (Curved)
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    // 3 pairs
    for (let i = 1; i <= 3; i++) {
      const w = 60 * i;
      const h = 200 - (i * 20);
      ctx.beginPath();
      ctx.moveTo(256 - w, h);
      ctx.quadraticCurveTo(256 - w, 300, 256, 300);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(256 + w, h);
      ctx.quadraticCurveTo(256 + w, 300, 256, 300);
      ctx.stroke();

      // Flames for branches
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath(); ctx.arc(256 - w, h - 15, 10, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(256 + w, h - 15, 10, 0, Math.PI * 2); ctx.fill();
    }

    // Center Flame
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath(); ctx.arc(256, 185, 12, 0, Math.PI * 2); ctx.fill();

    return new THREE.CanvasTexture(canvas)
  }

  const createStarTexture = () => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background - Israeli Blue/White flag style
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 512, 512); // White
    ctx.fillStyle = '#0038b8'; // Blue
    ctx.fillRect(0, 50, 512, 60); // Top Stripe
    ctx.fillRect(0, 402, 512, 60); // Bottom Stripe

    // Star of David
    ctx.strokeStyle = '#0038b8'; ctx.lineWidth = 15;
    const cx = 256, cy = 256, r = 100;

    // Triangle 1
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.866, cy + r * 0.5);
    ctx.lineTo(cx - r * 0.866, cy + r * 0.5);
    ctx.closePath();
    ctx.stroke();

    // Triangle 2
    ctx.beginPath();
    ctx.moveTo(cx, cy + r);
    ctx.lineTo(cx + r * 0.866, cy - r * 0.5);
    ctx.lineTo(cx - r * 0.866, cy - r * 0.5);
    ctx.closePath();
    ctx.stroke();

    return new THREE.CanvasTexture(canvas)
  }

  const createWesternWallTexture = () => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Sky
    ctx.fillStyle = '#87ceeb'; ctx.fillRect(0, 0, 512, 200);

    // Wall Stones
    ctx.fillStyle = '#e0cda8'; ctx.fillRect(0, 200, 512, 312); // Base

    // Stones pattern
    ctx.strokeStyle = '#c0b090'; ctx.lineWidth = 2;
    for (let y = 200; y < 512; y += 40) {
      let offset = (y % 80 === 0) ? 0 : 20;
      for (let x = -20; x < 512; x += 60) {
        ctx.strokeRect(x + offset, y, 60, 40);
        // Random stone shading
        if (Math.random() > 0.5) {
          ctx.fillStyle = 'rgba(0,0,0,0.05)';
          ctx.fillRect(x + offset + 2, y + 2, 56, 36);
        }
      }
    }

    // Greenery
    ctx.fillStyle = '#228b22';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, 200 + Math.random() * 200, 10 + Math.random() * 10, 0, Math.PI * 2);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas)
  }

  const createRedSeaTexture = () => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Sand path
    ctx.fillStyle = '#f0e68c'; ctx.fillRect(200, 0, 112, 512);

    // Water Walls
    ctx.fillStyle = '#00008b'; // Dark blue
    ctx.fillRect(0, 0, 200, 512); // Left
    ctx.fillRect(312, 0, 200, 512); // Right

    // Waves/Foam
    ctx.strokeStyle = '#40e0d0'; ctx.lineWidth = 5;
    for (let i = 0; i < 20; i++) {
      const y = Math.random() * 512;
      // Left waves
      ctx.beginPath(); ctx.moveTo(150, y); ctx.quadraticCurveTo(175, y - 20, 200, y); ctx.stroke();
      // Right waves
      ctx.beginPath(); ctx.moveTo(312, y); ctx.quadraticCurveTo(337, y - 20, 362, y); ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas)
  }

  const createSinaiTexture = () => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    // Sky
    ctx.fillStyle = '#191970'; ctx.fillRect(0, 0, 512, 512); // Midnight blue
    // Mountain
    ctx.fillStyle = '#2f4f4f';
    ctx.beginPath(); ctx.moveTo(0, 512); ctx.lineTo(256, 100); ctx.lineTo(512, 512); ctx.fill();
    // Tablets at top?
    ctx.fillStyle = '#deb887';
    ctx.fillRect(230, 80, 20, 30); ctx.fillRect(260, 80, 20, 30);
    return new THREE.CanvasTexture(canvas)
  }

  const createDoveTexture = () => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = '#87ceeb'; ctx.fillRect(0, 0, 512, 512); // Sky blue
    // Dove (Simple white shape)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(256, 256, 60, 0, Math.PI * 2); ctx.fill(); // Body
    ctx.beginPath(); ctx.moveTo(250, 250); ctx.lineTo(150, 200); ctx.lineTo(200, 300); ctx.fill(); // Wing
    ctx.beginPath(); ctx.arc(300, 240, 30, 0, Math.PI * 2); ctx.fill(); // Head
    // Olive branch
    ctx.strokeStyle = 'green'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(320, 250); ctx.lineTo(400, 280); ctx.stroke();
    return new THREE.CanvasTexture(canvas)
  }

  const createMatzahTexture = () => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = '#f5deb3'; ctx.fillRect(0, 0, 512, 512); // Wheat
    // Burn marks
    ctx.fillStyle = '#8b4513';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 512; const y = Math.random() * 512;
      ctx.beginPath(); ctx.arc(x, y, 2 + Math.random() * 4, 0, Math.PI * 2); ctx.fill();
    }
    // Lines
    ctx.strokeStyle = '#d2b48c'; ctx.lineWidth = 2;
    for (let i = 0; i < 512; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
    }
    return new THREE.CanvasTexture(canvas)
  }

  const createPomegranateTexture = () => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = '#f0e68c'; ctx.fillRect(0, 0, 512, 512); // Background
    // Pomegranates
    ctx.fillStyle = '#dc143c';
    for (let i = 0; i < 5; i++) {
      const cx = 100 + Math.random() * 300;
      const cy = 100 + Math.random() * 300;
      ctx.beginPath(); ctx.arc(cx, cy, 50, 0, Math.PI * 2); ctx.fill();
      // Crown
      ctx.beginPath(); ctx.moveTo(cx - 10, cy - 45); ctx.lineTo(cx, cy - 60); ctx.lineTo(cx + 10, cy - 45); ctx.fill();
    }
    return new THREE.CanvasTexture(canvas)
  }

  const createCupTexture = () => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = '#4b0082'; ctx.fillRect(0, 0, 512, 512); // Indigo
    // Cup
    ctx.fillStyle = 'silver';
    ctx.beginPath();
    ctx.moveTo(200, 400); ctx.lineTo(312, 400); // Base
    ctx.lineTo(280, 300); ctx.lineTo(280, 200); // Stem
    ctx.lineTo(350, 100); ctx.lineTo(162, 100); // Bow
    ctx.lineTo(232, 200); ctx.lineTo(232, 300);
    ctx.lineTo(200, 400);
    ctx.fill();
    return new THREE.CanvasTexture(canvas)
  }

  const shabbatTexture = useMemo(() => createShabbatTexture(), [])
  const menorahTexture = useMemo(() => createMenorahTexture(), [])
  const starTexture = useMemo(() => createStarTexture(), [])
  const wallTexture = useMemo(() => createWesternWallTexture(), [])
  const redSeaTexture = useMemo(() => createRedSeaTexture(), [])
  const sinaiTexture = useMemo(() => createSinaiTexture(), [])
  const doveTexture = useMemo(() => createDoveTexture(), [])
  const matzahTexture = useMemo(() => createMatzahTexture(), [])
  const pomTexture = useMemo(() => createPomegranateTexture(), [])
  const cupTexture = useMemo(() => createCupTexture(), [])

  const furnitureTextures = {
    wood: textures.furnitureWood,
    woodMahogany: textures.woodMahogany,
    woodOak: textures.woodOak,
    woodRustic: textures.woodRustic,
    fabric: textures.furnitureFabric,
    metal: textures.furnitureMetal,
    painting: textures.painting,
    paintingPassover: textures.paintingPassover,
    paintingShabbat: shabbatTexture || textures.paintingPassover,
    paintingMenorah: menorahTexture || textures.paintingPassover,
    paintingStar: starTexture || textures.paintingPassover,
    paintingWall: wallTexture || textures.paintingPassover,
    paintingRedSea: redSeaTexture || textures.paintingPassover,
    paintingSinai: sinaiTexture || textures.paintingPassover,
    paintingDove: doveTexture || textures.paintingPassover,
    paintingMatzah: matzahTexture || textures.paintingPassover,
    paintingPom: pomTexture || textures.paintingPassover,
    paintingCup: cupTexture || textures.paintingPassover,
    rug: textures.rug,
    books: textures.books
  }

  const floorGeo = useMemo(() => new THREE.PlaneGeometry(10, 10), [])
  const tileTypes = ['kitchen', 'bathroom', 'science_lab', 'lab']
  const tileRooms = useMemo(() => rooms.filter((r: any) => tileTypes.includes(r.type)), [rooms])
  const woodRooms = useMemo(() => rooms.filter((r: any) => !tileTypes.includes(r.type)), [rooms])

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
