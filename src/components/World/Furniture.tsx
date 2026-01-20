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
          {/* Working Light Source - No Shadow to save texture units */}
          <pointLight position={[0, 2.5, 0]} intensity={1.5} distance={10} color="#ffffaa" />
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
