import { useState, useEffect } from 'react'
import { Box, Cylinder, Sphere, Text, Ring } from '@react-three/drei'
import { useGameStore } from '../../store/gameStore'
import type { FurnitureItem } from '../../types'
import { useThree } from '@react-three/fiber'
import { Confetti } from '../FX/Confetti'
import * as THREE from 'three'

const Model = ({ type, color, textures, variant }: { type: FurnitureItem['type'], color?: string, textures: any, variant?: string }) => {
  // Materials
  const mahoganyMat = <meshStandardMaterial map={textures.woodMahogany} />
  const oakMat = <meshStandardMaterial map={textures.woodOak} />
  const rusticMat = <meshStandardMaterial map={textures.woodRustic} />

  const fabricMat = <meshStandardMaterial map={textures.fabric} color={color || "white"} />
  const metalMat = <meshStandardMaterial map={textures.metal} metalness={0.8} roughness={0.2} />
  const darkMat = <meshStandardMaterial color="#222" />

  switch (type) {
    case 'tv':
      return (
        <group>
          <Box args={[2, 1.2, 0.2]} position={[0, 1, 0]}>{darkMat}</Box>
          <Box args={[0.5, 0.4, 0.5]} position={[0, 0.2, 0]}>{darkMat}</Box>
        </group>
      )
    case 'fireplace':
      return (
        <group>
          <Box args={[2, 2, 0.5]} position={[0, 1, 0]}><meshStandardMaterial color="darkred" /></Box>
          <Box args={[1, 1, 0.1]} position={[0, 0.5, 0.25]}><meshStandardMaterial color="black" emissive="orange" emissiveIntensity={0.2} /></Box>
        </group>
      )
    case 'couch':
      // Basic fabric variation
      return (
        <group>
          <Box args={[3, 0.5, 1]} position={[0, 0.5, 0]}>{fabricMat}</Box>
          <Box args={[3, 1, 0.3]} position={[0, 1, -0.4]}>{fabricMat}</Box>
        </group>
      )
    case 'table':
      return (
        <group>
          <Box args={[2, 0.1, 2]} position={[0, 1, 0]}>{oakMat}</Box>
          <Box args={[0.2, 1, 0.2]} position={[-0.8, 0.5, -0.8]}>{oakMat}</Box>
          <Box args={[0.2, 1, 0.2]} position={[0.8, 0.5, -0.8]}>{oakMat}</Box>
          <Box args={[0.2, 1, 0.2]} position={[-0.8, 0.5, 0.8]}>{oakMat}</Box>
          <Box args={[0.2, 1, 0.2]} position={[0.8, 0.5, 0.8]}>{oakMat}</Box>
        </group>
      )
    case 'desk':
      return (
        <group>
          <Box args={[2.5, 0.1, 1.2]} position={[0, 1, 0]}>{mahoganyMat}</Box>
          <Box args={[0.2, 1, 1]} position={[-1, 0.5, 0]}>{mahoganyMat}</Box>
          <Box args={[0.2, 1, 1]} position={[1, 0.5, 0]}>{mahoganyMat}</Box>
        </group>
      )
    case 'chair':
      return (
        <group>
          <Box args={[0.8, 0.1, 0.8]} position={[0, 0.5, 0]}>{oakMat}</Box>
          <Box args={[0.8, 0.8, 0.1]} position={[0, 0.9, -0.35]}>{oakMat}</Box>
          <Box args={[0.1, 0.5, 0.1]} position={[-0.3, 0.25, -0.3]}>{oakMat}</Box>
          <Box args={[0.1, 0.5, 0.1]} position={[0.3, 0.25, -0.3]}>{oakMat}</Box>
          <Box args={[0.1, 0.5, 0.1]} position={[-0.3, 0.25, 0.3]}>{oakMat}</Box>
          <Box args={[0.1, 0.5, 0.1]} position={[0.3, 0.25, 0.3]}>{oakMat}</Box>
        </group>
      )
    case 'lamp':
      return (
        <group>
          <Cylinder args={[0.1, 0.2, 3]} position={[0, 1.5, 0]}>{metalMat}</Cylinder>
          <Cylinder args={[0.5, 1, 0.8]} position={[0, 3, 0]}><meshStandardMaterial color="white" emissive="yellow" emissiveIntensity={0.8} /></Cylinder>
          {/* Performance Opt: Removed dynamic PointLight for large scale support */}
        </group >
      )
    case 'bookshelf':
      return (
        <group>
          <Box args={[2, 4, 0.5]} position={[0, 2, 0]}>{mahoganyMat}</Box>
          {/* Books with Texture */}
          <Box args={[1.8, 0.8, 0.52]} position={[0, 1.2, 0]}><meshStandardMaterial map={textures.books} /></Box>
          <Box args={[1.8, 0.8, 0.52]} position={[0, 2.8, 0]}><meshStandardMaterial map={textures.books} /></Box>
        </group>
      )
    case 'bed':
      return (
        <group>
          <Box args={[2, 0.6, 3]} position={[0, 0.3, 0]}><meshStandardMaterial color="white" /></Box>
          <Box args={[2, 0.8, 0.2]} position={[0, 0.4, -1.6]}>{oakMat}</Box>
        </group>
      )
    case 'toilet':
      return (
        <group>
          <Box args={[0.8, 1, 0.8]} position={[0, 0.5, 0]}><meshStandardMaterial color="white" /></Box>
          <Box args={[0.8, 0.8, 0.3]} position={[0, 1.2, -0.4]}><meshStandardMaterial color="white" /></Box>
        </group>
      )
    case 'fridge':
      return <Box args={[1.5, 3, 1.5]} position={[0, 1.5, 0]}>{metalMat}</Box>
    case 'washer':
      return (
        <group>
          <Box args={[1.2, 1.5, 1.2]} position={[0, 0.75, 0]}><meshStandardMaterial color="white" /></Box>
          <Cylinder args={[0.4, 0.4, 0.1]} rotation={[Math.PI / 2, 0, 0]} position={[0, 1, 0.61]}><meshStandardMaterial color="#888" /></Cylinder>
        </group>
      )
    case 'dryer':
      return (
        <group>
          <Box args={[1.2, 1.5, 1.2]} position={[0, 0.75, 0]}><meshStandardMaterial color="white" /></Box>
          <Box args={[1, 0.2, 0.05]} position={[0, 1.4, 0.61]}><meshStandardMaterial color="#aaa" /></Box>
        </group>
      )
    case 'cabinet':
      return <Box args={[1.5, 1.5, 1]} position={[0, 0.75, 0]}>{oakMat}</Box>
    case 'tool_chest':
      return <Box args={[2, 1.5, 1]} position={[0, 0.75, 0]}><meshStandardMaterial color="red" metalness={0.7} /></Box>
    case 'plant':
      return (
        <group>
          <Cylinder args={[0.4, 0.3, 0.8]} position={[0, 0.4, 0]}><meshStandardMaterial color="brown" /></Cylinder>
          <Sphere args={[0.6]} position={[0, 1.2, 0]}><meshStandardMaterial color="green" /></Sphere>
        </group>
      )
    case 'monitor':
      return (
        <group>
          <Box args={[1, 0.6, 0.1]} position={[0, 1.3, 0]}><meshStandardMaterial color="black" /></Box>
          <Cylinder args={[0.1, 0.1, 0.3]} position={[0, 1, 0]}>{darkMat}</Cylinder>
        </group>
      )
    case 'treadmill':
      return (
        <group>
          <Box args={[1.5, 0.2, 3]} position={[0, 0.1, 0]}>{darkMat}</Box>
          <Box args={[1.5, 1.5, 0.1]} position={[0, 1.5, -1.4]}>{metalMat}</Box>
        </group>
      )
    case 'bench':
      return <Box args={[2, 0.5, 0.8]} position={[0, 0.25, 0]}>{rusticMat}</Box>
    case 'dumbbell':
      return (
        <group position={[0, 0.1, 0]}>
          <Cylinder args={[0.1, 0.1, 0.8]} rotation={[0, 0, Math.PI / 2]}><meshStandardMaterial color="gray" /></Cylinder>
          <Cylinder args={[0.2, 0.2, 0.1]} rotation={[0, 0, Math.PI / 2]} position={[-0.3, 0, 0]}><meshStandardMaterial color="black" /></Cylinder>
          <Cylinder args={[0.2, 0.2, 0.1]} rotation={[0, 0, Math.PI / 2]} position={[0.3, 0, 0]}><meshStandardMaterial color="black" /></Cylinder>
        </group>
      )
    case 'piano':
      return (
        <group>
          <Box args={[3, 1.5, 1.2]} position={[0, 0.75, 0]}><meshStandardMaterial color="black" /></Box>
          <Box args={[2.8, 0.1, 0.3]} position={[0, 0.8, 0.6]}><meshStandardMaterial color="white" /></Box>
        </group>
      )
    case 'easel':
      return (
        <group>
          <Cylinder args={[0.05, 0.05, 2]} position={[-0.5, 1, 0]} rotation={[0, 0, -0.2]}>{rusticMat}</Cylinder>
          <Cylinder args={[0.05, 0.05, 2]} position={[0.5, 1, 0]} rotation={[0, 0, 0.2]}>{rusticMat}</Cylinder>
          <Box args={[1.2, 0.8, 0.1]} position={[0, 1.5, 0.1]}><meshStandardMaterial color="white" /></Box>
        </group>
      )
    case 'server_rack':
      return (
        <Box args={[1, 3, 1]} position={[0, 1.5, 0]}><meshStandardMaterial color="#111" emissive="green" emissiveIntensity={0.1} /></Box>
      )
    case 'drum_kit':
      return (
        <group>
          <Cylinder args={[0.8, 0.8, 0.5]} position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}><meshStandardMaterial color="red" /></Cylinder>
          <Cylinder args={[0.4, 0.4, 0.3]} position={[-0.8, 0.8, 0]}><meshStandardMaterial color="white" /></Cylinder>
        </group>
      )
    case 'sculpture':
      return (
        <group>
          <Cylinder args={[0.3, 0.3, 1]} position={[0, 0.5, 0]}><meshStandardMaterial color="#888" /></Cylinder>
          <Sphere args={[0.5]} position={[0, 1.2, 0]}><meshStandardMaterial color="gold" metalness={1} roughness={0} /></Sphere>
        </group>
      )
    case 'rug':
      return <Box args={[3, 0.02, 2]} position={[0, 0.01, 0]}><meshStandardMaterial map={textures.rug} /></Box>
    case 'safe':
      return (
        <Box args={[1.5, 1.5, 1.5]} position={[0, 0.75, 0]}>
          <meshStandardMaterial color="#444" metalness={0.9} roughness={0.1} />
        </Box>
      )
    case 'painting':
      let paintingTex = textures.painting
      let frameColor = '#D4AF37' // Gold

      if (variant === 'passover') {
        paintingTex = textures.paintingPassover
        frameColor = '#FFD700' // Gold
      } else if (variant === 'western_wall') {
        paintingTex = textures.paintingPassover
        frameColor = '#C0C0C0' // Silver
      } else if (variant === 'shabbat') {
        paintingTex = textures.paintingShabbat
        frameColor = '#C0C0C0' // Silver
      }

      return (
        <group position={[0, 2, 0]}> {/* Higher up on wall */}
          {/* Frame */}
          <Box args={[1.7, 1.7, 0.05]} position={[0, 0, -0.02]}>
            <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
          </Box>
          {/* Canvas */}
          <Box args={[1.5, 1.5, 0.02]}>
            {/* Use white color to not tint the texture */}
            <meshStandardMaterial map={paintingTex} color="white" />
          </Box>
        </group>
      )
    case 'arcade_game':
      return (
        <group>
          <Box args={[0.8, 2, 0.8]} position={[0, 1, 0]}><meshStandardMaterial color="#222" /></Box>
          <Box args={[0.6, 0.6, 0.1]} position={[0, 1.4, 0.36]}><meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={0.5} /></Box>
          <Box args={[0.8, 0.4, 0.4]} position={[0, 1, 0.4]}><meshStandardMaterial color="#333" /></Box>
        </group>
      )
    case 'pool_table':
      return (
        <group>
          <Box args={[2.5, 0.2, 1.4]} position={[0, 0.91, 0]}><meshStandardMaterial color="green" /></Box>
          <Box args={[2.7, 0.2, 1.6]} position={[0, 0.9, 0]}><meshStandardMaterial color="brown" /></Box>
          <Cylinder args={[0.1, 0.1, 0.9]} position={[-1.2, 0.45, -0.6]}><meshStandardMaterial color="brown" /></Cylinder>
          <Cylinder args={[0.1, 0.1, 0.9]} position={[1.2, 0.45, -0.6]}><meshStandardMaterial color="brown" /></Cylinder>
          <Cylinder args={[0.1, 0.1, 0.9]} position={[-1.2, 0.45, 0.6]}><meshStandardMaterial color="brown" /></Cylinder>
          <Cylinder args={[0.1, 0.1, 0.9]} position={[1.2, 0.45, 0.6]}><meshStandardMaterial color="brown" /></Cylinder>
        </group>
      )
    case 'vending_machine':
      return (
        <group>
          <Box args={[1.2, 2.2, 1]} position={[0, 1.1, 0]}><meshStandardMaterial color="#cc0000" /></Box>
          <Box args={[0.9, 1.2, 0.1]} position={[0, 1.4, 0.46]}><meshStandardMaterial color="#88ccff" opacity={0.5} transparent /></Box>
          <Box args={[0.8, 0.3, 0.1]} position={[0, 0.5, 0.46]}><meshStandardMaterial color="#333" /></Box>
        </group>
      )
    case 'cinema_screen':
      return (
        <group>
          <Box args={[6, 3.5, 0.1]} position={[0, 4.5, 0]}><meshStandardMaterial color="#ddd" /></Box>
          <Box args={[6.2, 3.7, 0.05]} position={[0, 4.5, -0.05]}><meshStandardMaterial color="black" /></Box>
        </group>
      )
    case 'bimah':
      return (
        <group>
          <Box args={[1.5, 1, 1.5]} position={[0, 0.5, 0]}>{mahoganyMat}</Box>
          <Box args={[1.5, 0.1, 1.5]} position={[0, 1.05, 0]}><meshStandardMaterial color="blue" /></Box> {/* Cloth */}
          <Box args={[0.8, 0.4, 0.5]} position={[0, 1.2, 0.3]} rotation={[0.4, 0, 0]}>{oakMat}</Box> {/* Stand */}
        </group>
      )
    case 'lab_bench':
      return (
        <group>
          <Box args={[2.5, 0.1, 1]} position={[0, 1, 0]}><meshStandardMaterial color="#444" /></Box>
          <Box args={[0.1, 1, 0.8]} position={[-1, 0.5, 0]}>{metalMat}</Box>
          <Box args={[0.1, 1, 0.8]} position={[1, 0.5, 0]}>{metalMat}</Box>
          {/* Beaker */}
          <Cylinder args={[0.1, 0.1, 0.2]} position={[-0.5, 1.1, 0.2]}><meshStandardMaterial color="cyan" transparent opacity={0.6} /></Cylinder>
        </group>
      )
    case 'microscope':
      return (
        <group position={[0, 1, 0]}>
          <Box args={[0.2, 0.4, 0.2]} position={[0, 0.2, 0]}>{metalMat}</Box>
          <Cylinder args={[0.05, 0.05, 0.3]} position={[0, 0.3, 0.1]} rotation={[0.5, 0, 0]}><meshStandardMaterial color="black" /></Cylinder>
        </group>
      )
    case 'whiteboard':
      return (
        <group position={[0, 2, 0]}>
          <Box args={[3, 2, 0.05]}><meshStandardMaterial color="white" /></Box>
          <Box args={[3.1, 2.1, 0.04]} position={[0, 0, -0.01]}>{metalMat}</Box>
          {/* Sribbles */}
          <Box args={[1, 0.05, 0.06]} position={[-0.5, 0, 0]} rotation={[0, 0, 0.2]}><meshStandardMaterial color="blue" /></Box>
        </group>
      )
    case 'crib':
      return (
        <group>
          <Box args={[1.5, 0.1, 0.8]} position={[0, 0.5, 0]}><meshStandardMaterial color="white" /></Box>
          {/* Rails */}
          <Box args={[1.5, 1, 0.05]} position={[0, 1, -0.4]}><meshStandardMaterial color="white" /></Box>
          <Box args={[1.5, 1, 0.05]} position={[0, 1, 0.4]}><meshStandardMaterial color="white" /></Box>
          <Box args={[0.05, 1, 0.8]} position={[-0.75, 1, 0]}><meshStandardMaterial color="white" /></Box>
          <Box args={[0.05, 1, 0.8]} position={[0.75, 1, 0]}><meshStandardMaterial color="white" /></Box>
        </group>
      )
    case 'toy_chest':
      return (
        <group>
          <Box args={[1.5, 0.8, 0.8]} position={[0, 0.4, 0]}><meshStandardMaterial color="#ffcc80" /></Box>
          <Box args={[1.5, 0.1, 0.8]} position={[0, 0.8, 0]} rotation={[0.2, 0, 0]}><meshStandardMaterial color="#ffb74d" /></Box>
        </group>
      )
    case 'changing_table':
      return (
        <group>
          <Box args={[1.5, 1, 0.8]} position={[0, 0.5, 0]}><meshStandardMaterial color="white" /></Box>
          {/* Pad */}
          <Box args={[1.3, 0.1, 0.6]} position={[0, 1.05, 0]}><meshStandardMaterial color="pink" /></Box>
        </group>
      )
    case 'bar_counter':
      return (
        <group>
          <Box args={[3, 1.2, 0.8]} position={[0, 0.6, 0]}>{mahoganyMat}</Box>
          <Box args={[3.2, 0.1, 1]} position={[0, 1.2, 0]}> <meshStandardMaterial color="black" metalness={0.8} roughness={0.1} /></Box>
        </group>
      )
    case 'stool':
      return (
        <group>
          <Cylinder args={[0.3, 0.3, 0.1]} position={[0, 0.8, 0]}><meshStandardMaterial color="red" /></Cylinder>
          <Cylinder args={[0.05, 0.05, 0.8]} position={[0, 0.4, 0]}>{metalMat}</Cylinder>
          <Cylinder args={[0.3, 0.3, 0.05]} position={[0, 0.025, 0]}>{metalMat}</Cylinder>
        </group>
      )
    case 'jukebox':
      return (
        <group>
          <Box args={[1, 1.8, 0.8]} position={[0, 0.9, 0]}><meshStandardMaterial color="#333" /></Box>
          {/* Glowing tubes */}
          <Cylinder args={[0.05, 0.05, 1.5]} position={[-0.5, 0.9, 0.4]}><meshStandardMaterial color="magenta" emissive="magenta" /></Cylinder>
          <Cylinder args={[0.05, 0.05, 1.5]} position={[0.5, 0.9, 0.4]}><meshStandardMaterial color="cyan" emissive="cyan" /></Cylinder>
          {/* Arch */}
          <Ring args={[0.4, 0.5, 32, 1, 0, Math.PI]} position={[0, 1.5, 0.41]}><meshStandardMaterial color="yellow" emissive="yellow" /></Ring>
        </group>
      )
    case 'telescope':
      return (
        <group>
          <Cylinder args={[0.05, 0.1, 1]} position={[0, 0.5, 0]} rotation={[0.2, 0, 0]}>{metalMat}</Cylinder> {/* Tripod leg 1 */}
          <Cylinder args={[0.05, 0.1, 1]} position={[0.4, 0.5, 0]} rotation={[-0.2, 0, 0.2]}>{metalMat}</Cylinder> {/* Tripod leg 2 */}
          <Cylinder args={[0.05, 0.1, 1]} position={[-0.4, 0.5, 0]} rotation={[-0.2, 0, -0.2]}>{metalMat}</Cylinder> {/* Tripod leg 3 */}
          <Cylinder args={[0.15, 0.2, 1.5]} position={[0, 1.4, 0]} rotation={[Math.PI / 4, 0, 0]}><meshStandardMaterial color="white" /></Cylinder>
        </group>
      )
    case 'sauna_bench':
      return <Box args={[2, 0.6, 1]} position={[0, 0.3, 0]}>{rusticMat}</Box>
    case 'heater':
      return (
        <group>
          <Box args={[0.8, 1, 0.8]} position={[0, 0.5, 0]}><meshStandardMaterial color="#444" /></Box>
          {/* Stones */}
          <Sphere args={[0.15]} position={[0, 1, 0]}><meshStandardMaterial color="gray" /></Sphere>
          <Sphere args={[0.15]} position={[0.2, 1.05, 0.1]}><meshStandardMaterial color="gray" /></Sphere>
          <Sphere args={[0.15]} position={[-0.2, 1.02, -0.1]}><meshStandardMaterial color="gray" /></Sphere>
        </group>
      )
    case 'wine_rack':
      return (
        <group>
          <Box args={[1.5, 2.5, 0.5]} position={[0, 1.25, 0]}>{mahoganyMat}</Box>
          {/* Bottles */}
          <Cylinder args={[0.08, 0.08, 0.4]} position={[0, 1, 0.3]} rotation={[Math.PI / 2, 0, 0]}><meshStandardMaterial color="darkred" /></Cylinder>
          <Cylinder args={[0.08, 0.08, 0.4]} position={[0.3, 1.5, 0.3]} rotation={[Math.PI / 2, 0, 0]}><meshStandardMaterial color="green" /></Cylinder>
          <Cylinder args={[0.08, 0.08, 0.4]} position={[-0.3, 2, 0.3]} rotation={[Math.PI / 2, 0, 0]}><meshStandardMaterial color="darkred" /></Cylinder>
        </group>
      )
    case 'barrel':
      return (
        <group>
          <Cylinder args={[0.5, 0.5, 1]} position={[0, 0.5, 0]}><meshStandardMaterial map={textures.woodRustic} /></Cylinder>
          {/* Hoops */}
          <Ring args={[0.51, 0.55, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.8, 0]}><meshStandardMaterial color="black" /></Ring>
          <Ring args={[0.51, 0.55, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}><meshStandardMaterial color="black" /></Ring>
        </group>
      )
    case 'workbench':
      return (
        <group>
          <Box args={[2.5, 0.1, 1]} position={[0, 1, 0]}><meshStandardMaterial map={textures.woodRustic} /></Box>
          <Box args={[0.1, 1, 0.8]} position={[-1, 0.5, 0]}>{metalMat}</Box>
          <Box args={[0.1, 1, 0.8]} position={[1, 0.5, 0]}>{metalMat}</Box>
        </group>
      )
    case 'drill_press':
      return (
        <group>
          <Box args={[0.5, 0.1, 0.5]} position={[0, 1, 0]}><meshStandardMaterial color="gray" /></Box>
          <Cylinder args={[0.05, 0.05, 1]} position={[0, 1.5, -0.2]}><meshStandardMaterial color="gray" /></Cylinder>
          <Box args={[0.3, 0.5, 0.4]} position={[0, 2, -0.1]}><meshStandardMaterial color="teal" /></Box>
          <Cylinder args={[0.02, 0.02, 0.4]} position={[0, 1.6, 0]}><meshStandardMaterial color="silver" /></Cylinder>
        </group>
      )
    case 'saw':
      return (
        <group>
          <Box args={[0.8, 0.1, 0.8]} position={[0, 1, 0]}><meshStandardMaterial color="gray" /></Box>
          {/* Blade */}
          <Cylinder args={[0.25, 0.25, 0.02]} position={[0, 1.15, 0]} rotation={[0, 0, Math.PI / 2]}><meshStandardMaterial color="silver" metalness={1} /></Cylinder>
        </group>
      )
    case 'menorah':
      return (
        <group>
          <Cylinder args={[0.05, 0.1, 0.2]} position={[0, 0.1, 0]}><meshStandardMaterial color="gold" /></Cylinder>
          {/* Branches */}
          {[...Array(9)].map((_, i) => {
            const x = (i - 4) * 0.15
            const h = i === 4 ? 0.4 : 0.3 + Math.abs(i - 4) * 0.02
            return (
              <group key={i} position={[x, h / 2 + 0.2, 0]}>
                <Cylinder args={[0.02, 0.02, h]}><meshStandardMaterial color="gold" /></Cylinder>
                <Sphere args={[0.03]} position={[0, h / 2, 0]}><meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.5} /></Sphere>
              </group>
            )
          })}
          <Box args={[1.4, 0.05, 0.05]} position={[0, 0.2, 0]}><meshStandardMaterial color="gold" /></Box>
        </group>
      )
    case 'seder_plate':
      return (
        <group>
          <Cylinder args={[0.3, 0.3, 0.02]} position={[0, 0.01, 0]}><meshStandardMaterial color="silver" metalness={0.9} roughness={0.2} /></Cylinder>
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2
            return <Sphere key={i} args={[0.05]} position={[Math.cos(angle) * 0.2, 0.03, Math.sin(angle) * 0.2]}><meshStandardMaterial color="white" /></Sphere>
          })}
        </group>
      )
    case 'mikvah_pool':
      return (
        <group>
          <Box args={[3, 0.5, 3]} position={[0, 0.25, 0]}><meshStandardMaterial map={textures.tile} /></Box>
          {/* Water */}
          <Box args={[2.6, 0.4, 2.6]} position={[0, 0.3, 0]}><meshStandardMaterial color="#00aaff" transparent opacity={0.6} /></Box>
          {/* Steps */}
          <Box args={[0.5, 0.2, 0.5]} position={[1, 0.35, 1]}><meshStandardMaterial map={textures.tile} /></Box>
          <Box args={[0.5, 0.4, 0.5]} position={[1.5, 0.35, 1]}><meshStandardMaterial map={textures.tile} /></Box>
        </group>
      )
    case 'open_book':
      return (
        <group>
          <Box args={[0.4, 0.05, 0.3]} position={[0.2, 0.025, 0]} rotation={[0, 0, 0.1]}><meshStandardMaterial color="white" /></Box>
          <Box args={[0.4, 0.05, 0.3]} position={[-0.2, 0.025, 0]} rotation={[0, 0, -0.1]}><meshStandardMaterial color="white" /></Box>
          <Box args={[0.85, 0.02, 0.32]} position={[0, 0.01, 0]}><meshStandardMaterial color="darkblue" /></Box>
        </group>
      )
    case 'torah_scroll':
      return (
        <group>
          {/* Scroll Body */}
          <Cylinder args={[0.1, 0.1, 0.6]} position={[-0.1, 0.3, 0]}><meshStandardMaterial color="#f0e68c" /></Cylinder>
          <Cylinder args={[0.1, 0.1, 0.6]} position={[0.1, 0.3, 0]}><meshStandardMaterial color="#f0e68c" /></Cylinder>
          {/* Handles */}
          <Cylinder args={[0.02, 0.02, 0.8]} position={[-0.1, 0.3, 0]}><meshStandardMaterial map={textures.woodMahogany} /></Cylinder>
          <Cylinder args={[0.02, 0.02, 0.8]} position={[0.1, 0.3, 0]}><meshStandardMaterial map={textures.woodMahogany} /></Cylinder>
          {/* Cover */}
          <Box args={[0.3, 0.4, 0.25]} position={[0, 0.3, 0]}><meshStandardMaterial color="darkblue" /></Box>
          <Box args={[0.05, 0.05, 0.05]} position={[0, 0.4, 0.13]}><meshStandardMaterial color="gold" /></Box> {/* Star of David approx */}
        </group>
      )
    case 'chandelier':
      return (
        <group position={[0, 4, 0]}>
          <Cylinder args={[0.05, 0.05, 1]} position={[0, -0.5, 0]}><meshStandardMaterial color="gold" /></Cylinder>
          {/* Arms */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2
            return (
              <group key={i} rotation={[0, angle, 0]}>
                <Box args={[0.8, 0.05, 0.05]} position={[0.4, -0.5, 0]}><meshStandardMaterial color="gold" /></Box>
                <Sphere args={[0.1]} position={[0.8, -0.4, 0]}><meshStandardMaterial color="white" emissive="white" emissiveIntensity={1} /></Sphere>
              </group>
            )
          })}
        </group>
      )
    case 'fish_tank':
      return (
        <group>
          <Box args={[2.5, 1.5, 0.8]} position={[0, 0.75, 0]}><meshStandardMaterial color="#00aaff" transparent opacity={0.3} /></Box>
          <Box args={[2.6, 0.1, 0.9]} position={[0, 0, 0]}><meshStandardMaterial color="black" /></Box>
          <Box args={[2.6, 0.1, 0.9]} position={[0, 1.5, 0]}><meshStandardMaterial color="black" /></Box>
          {/* Fish */}
          <Box args={[0.2, 0.1, 0.05]} position={[0.5, 0.5, 0]}><meshStandardMaterial color="orange" /></Box>
          <Box args={[0.2, 0.1, 0.05]} position={[-0.5, 1, 0.2]}><meshStandardMaterial color="gold" /></Box>
        </group>
      )
    case 'trophy_case':
      return (
        <group>
          <Box args={[1.5, 2.5, 0.5]} position={[0, 1.25, 0]}><meshStandardMaterial color="#8B4513" transparent opacity={0.2} /></Box>
          <Box args={[1.6, 0.1, 0.6]} position={[0, 0, 0]}><meshStandardMaterial color="black" /></Box>
          {/* Shelves */}
          <Box args={[1.4, 0.05, 0.4]} position={[0, 0.8, 0]}><meshStandardMaterial color="#888" /></Box>
          <Box args={[1.4, 0.05, 0.4]} position={[0, 1.6, 0]}><meshStandardMaterial color="#888" /></Box>
          {/* Trophies */}
          <Cylinder args={[0.1, 0.05, 0.3]} position={[0, 1.0, 0]}><meshStandardMaterial color="gold" metalness={1} /></Cylinder>
          <Cylinder args={[0.1, 0.05, 0.3]} position={[-0.4, 1.8, 0]}><meshStandardMaterial color="silver" metalness={1} /></Cylinder>
          <Cylinder args={[0.1, 0.05, 0.3]} position={[0.4, 1.8, 0]}><meshStandardMaterial color="#cd7f32" metalness={1} /></Cylinder>
        </group>
      )
    case 'baker_rack':
      return (
        <group>
          <Cylinder args={[0.05, 0.05, 2.5]} position={[-1, 1.25, -0.4]}><meshStandardMaterial color="#333" /></Cylinder>
          <Cylinder args={[0.05, 0.05, 2.5]} position={[1, 1.25, -0.4]}><meshStandardMaterial color="#333" /></Cylinder>
          <Cylinder args={[0.05, 0.05, 2.5]} position={[-1, 1.25, 0.4]}><meshStandardMaterial color="#333" /></Cylinder>
          <Cylinder args={[0.05, 0.05, 2.5]} position={[1, 1.25, 0.4]}><meshStandardMaterial color="#333" /></Cylinder>
          {/* Shelves */}
          {[0.5, 1, 1.5, 2].map(y => (
            <Box key={y} args={[2.2, 0.05, 1]} position={[0, y, 0]}><meshStandardMaterial color="#888" metalness={0.5} /></Box>
          ))}
          {/* Bread */}
          <Sphere args={[0.2]} position={[-0.5, 1.6, 0]} scale={[1, 0.6, 1]}><meshStandardMaterial color="#f4a460" /></Sphere>
          <Sphere args={[0.2]} position={[0.5, 1.6, 0]} scale={[1, 0.6, 1]}><meshStandardMaterial color="#f4a460" /></Sphere>
        </group>
      )
    case 'oven_industrial':
      return (
        <group>
          <Box args={[1.5, 2, 1]} position={[0, 1, 0]}><meshStandardMaterial color="silver" metalness={0.8} /></Box>
          {/* Window */}
          <Box args={[1, 0.8, 0.05]} position={[0, 1.2, 0.5]}><meshStandardMaterial color="#222" /></Box>
          {/* Handle */}
          <Box args={[1.2, 0.05, 0.1]} position={[0, 1.7, 0.6]}><meshStandardMaterial color="black" /></Box>
        </group>
      )
    default:
      return <Box position={[0, 0.5, 0]}><meshStandardMaterial color="magenta" /></Box>
  }
}

export const Furniture = ({ item, textures }: { item: FurnitureItem, textures: any }) => {
  const foundLocations = useGameStore(state => state.foundLocations)
  const hiddenPieces = useGameStore(state => state.hiddenPieces)
  useThree()

  const isSearched = foundLocations[item.id]
  const hasPiece = hiddenPieces[item.id]
  const isSearchable = item.type !== 'safe' && item.type !== 'dumbbell' && item.type !== 'monitor' && item.type !== 'rug'
  // Use global hovered state
  const hoveredId = useGameStore(state => state.hoveredId)
  const hovered = hoveredId === item.id

  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isSearched && hasPiece) {
      setShowConfetti(true)
    }
  }, [isSearched, hasPiece])

  // NOTE: Interaction is now handled globally via Reticle + Click
  // But we can keep this for direct clicks if we want hybrid?
  // Actually, let's allow the Player raycaster to handle interaction logic too.

  return (
    <group position={item.position} rotation={item.rotation} userData={{ furnitureId: item.id }}>
      {/* Remove local Interactable for click if we move to global handler, 
          BUT for now let's keep it simple: WE NEED userData for Raycaster */}
      <group>
        <Model type={item.type} color={item.color} textures={textures} variant={item.variant} />


          {/* Highlight Ring on Floor */}
          {hovered && isSearchable && !isSearched && (
            <Ring
              args={[1.5, 1.8, 32]}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.05, 0]}
              raycast={() => null}
            >
              <meshBasicMaterial
                color="#00ff00"
                transparent
                opacity={0.8}
                side={THREE.DoubleSide}
              />
            </Ring>
          )}

          {/* Red Ring for already searched */}
          {hovered && isSearchable && isSearched && (
            <Ring
              args={[1.5, 1.8, 32]}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.05, 0]}
              raycast={() => null}
            >
              <meshBasicMaterial color="red" transparent opacity={0.8} side={THREE.DoubleSide} />
            </Ring>
          )}

          {/* Safe Special Highlight */}
          {item.type === 'safe' && (
            <>
              {hovered && (
                <Ring
                  args={[2, 2.3, 32]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  position={[0, 0.05, 0]}
                  raycast={() => null}
                >
                  <meshBasicMaterial color="white" side={THREE.DoubleSide} />
                </Ring>
              )}
              <Text
                position={[0, 3, 0]}
                fontSize={0.8}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="black"
              >
                Free Me!
              </Text>
            </>
          )}

          {/* Confetti Spawn */}
          {showConfetti && (
            <Confetti position={[0, 2, 0]} count={50} />
        )}
      </group>
    </group>
  )
}
