import { create } from 'zustand'
import type { GameStore, RoomData, FurnitureItem } from '../types'

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'intro',
  joystickInput: { x: 0, y: 0 },
  lookStickInput: { x: 0, y: 0 },
  lookInput: { x: 0, y: 0 },
  hoveredId: null,
  notification: null,
  secretCode: '1234',
  puzzlePiecesFound: 0,
  totalPuzzlePieces: 5,
  targetPuzzlePieces: 5, // Configured target
  hasKey: false,
  gridSize: 5,
  isMusicEnabled: true, // Default ON
  isGyroEnabled: false, // Default OFF (Requires permission)
  timeOfDay: 'night', // Default Night

  // Metrics
  startTime: 0,
  elapsedTime: 0,
  furnitureSearched: 0,

  hiddenPieces: {},
  foundLocations: {},
  rooms: [],
  furniture: [],

  setGameState: (state) => set({ gameState: state }),
  setGridSize: (size) => set({ gridSize: size }),
  setJoystickInput: (input) => set({ joystickInput: input }),
  setLookStickInput: (input) => set({ lookStickInput: input }),
  setLookInput: (input) => set({ lookInput: input }),
  addLookInput: (input: { x: number, y: number }) => set((state) => ({ lookInput: { x: state.lookInput.x + input.x, y: state.lookInput.y + input.y } })),
  setHoveredId: (id) => set({ hoveredId: id }),
  showNotification: (msg) => {
    set({ notification: msg })
    setTimeout(() => set({ notification: null }), 3000)
  },
  toggleMusic: () => set(state => ({ isMusicEnabled: !state.isMusicEnabled })),
  toggleGyro: () => set(state => ({ isGyroEnabled: !state.isGyroEnabled })),
  setTotalPieces: (count) => set({ totalPuzzlePieces: count, targetPuzzlePieces: count }),
  registerLocation: () => { },
  resetGame: () => {
    const { gridSize } = get()
    // 1. Generate Rooms on a Grid
    const newRooms: RoomData[] = []
    const newFurniture: FurnitureItem[] = []

    // Expanded Grid
    const spacing = 10
    // Pool of rooms (excluding Living Room which is always center)
    const availableRoomTypes = [
      'dining', 'kitchen', 'bedroom', 'bathroom', 'office', 'gym', 'library', 'guest_room', 'pantry',
      'garage', 'art_studio', 'music_room', 'tech_lab', 'game_room', 'theater', 'prayer_room',
      'science_lab', 'nursery', 'lounge', 'observatory', 'sauna', 'wine_cellar', 'workshop',
      'mikvah', 'beit_midrash', 'sukkah', 'ballroom', 'aquarium', 'trophy_room', 'bakery'
    ]

    // Add colors for new rooms
    const colors: Record<string, string> = {
      living: '#f0e68c', dining: '#cd853f', bedroom: '#e9967a', kitchen: '#add8e6', bathroom: '#ffffff',
      hall: '#d3d3d3', office: '#deb887', gym: '#b0c4de', library: '#8b4513', guest_room: '#ffa07a',
      pantry: '#fffacd', garage: '#696969', art_studio: '#dda0dd', music_room: '#20b2aa', tech_lab: '#708090',
      game_room: '#ff69b4', theater: '#000000', prayer_room: '#ffd700', science_lab: '#00ced1',
      nursery: '#ffb6c1', lounge: '#800080', observatory: '#191970', sauna: '#8b4500',
      wine_cellar: '#550000', workshop: '#a9a9a9', mikvah: '#00bfff', beit_midrash: '#8b4513',
      sukkah: '#228b22', ballroom: '#fff0f5', aquarium: '#008b8b', trophy_room: '#daa520',
      bakery: '#ffe4b5'
    }

    const center = Math.floor(gridSize / 2)

    // Shuffle Bag Logic
    let bag = [...availableRoomTypes].sort(() => Math.random() - 0.5)

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        let type = 'hall'

        if (x === center && z === center) {
          type = 'living'
        } else {
          if (bag.length === 0) {
            // Refill bag if empty (for larger grids)
            bag = [...availableRoomTypes].sort(() => Math.random() - 0.5)
          }
          type = bag.pop() as RoomData['type']
        }

        newRooms.push({
          id: `room_${x}_${z}`,
          position: [(x - center) * spacing, 0, (z - center) * spacing],
          type: type as RoomData['type'],
          color: colors[type] || '#ccc'
        })

      }
    }

    let safePlaced = false

    // 2. Generate Furniture per Room
    newRooms.forEach(room => {
      const [rx, ry, rz] = room.position

      const addFurn = (type: FurnitureItem['type'], lx: number, lz: number, rotY = 0, specificVariant?: string, _noJitter = false) => {
        let variant: string | undefined = specificVariant
        if (type === 'painting' && !variant) {
          const rand = Math.random()
          // Expanded Art collection (10+ types)
          if (rand > 0.92) variant = 'passover'
          else if (rand > 0.84) variant = 'shabbat'
          else if (rand > 0.76) variant = 'western_wall'
          else if (rand > 0.68) variant = 'menorah'
          else if (rand > 0.60) variant = 'star'
          else if (rand > 0.52) variant = 'red_sea'
          else if (rand > 0.44) variant = 'sinai'
          else if (rand > 0.36) variant = 'dove'
          else if (rand > 0.28) variant = 'matzah'
          else if (rand > 0.20) variant = 'pom'
          else if (rand > 0.12) variant = 'cup'
          else variant = undefined // Abstract/Default
        }

        // Aesthetic Jitter
        // Aesthetic Jitter removed per user request

        newFurniture.push({
          id: `${room.id}_${type}_${Math.random().toString(36).substr(2, 4)}`,
          type,
          position: [rx + lx, ry, rz + lz],
          rotation: [0, rotY, 0],
          variant
        })
      }

      switch (room.type) {
        case 'living':
          // Vignette: Conversation Area
          addFurn('rug', 0, 0)
          addFurn('table', 0, 0) // Coffee Table Center

          // Sofa + Armchairs layout
          if (Math.random() > 0.5) {
            // Layout A: Sofa backing to wall, chairs opposite
            addFurn('couch', 0, -2.5, 0, undefined, true) // Sofa 
            addFurn('chair', -2, 1.5, Math.PI) // Angled chair -> Straight
            addFurn('chair', 2, 1.5, Math.PI) // Angled chair -> Straight
          } else {
            // Layout B: L-Shape
            addFurn('couch', -2, -2, Math.PI / 4)
            addFurn('couch', 2, -2, -Math.PI / 4)
          }

          addFurn('tv', 3.8, 0, -Math.PI / 2, undefined, true) // Side wall TV
          addFurn('cabinet', 3.8, 0, -Math.PI / 2, undefined, true) // TV Console

          addFurn('lamp', -3.5, 3.5)
          addFurn('plant', 3.5, 3.5)

          if (Math.random() > 0.5) addFurn('bookshelf', -3.5, -2, Math.PI / 2, undefined, true)

          // Art Gallery feel
          addFurn('painting', 2.5, -4.8, 0, 'passover', true) // Feature piece (Offset from door)
          addFurn('painting', -4.8, 0, Math.PI / 2, undefined, true)
          addFurn('painting', 4.8, 0, -Math.PI / 2, undefined, true)
          break
        case 'dining':
          addFurn('rug', 0, 0)
          addFurn('table', 0, 0, 0, undefined, true) // Center Table

          // Chairs tight to table - minimal jitter or carefully managed
          addFurn('chair', -1.2, 0, Math.PI / 2, undefined, true)
          addFurn('chair', 1.2, 0, -Math.PI / 2, undefined, true)
          addFurn('chair', 0, -1.2, 0, undefined, true)
          addFurn('chair', 0, 1.2, Math.PI, undefined, true)

          // Add corners
          addFurn('cabinet', -3.5, 3.5, Math.PI, undefined, true)
          addFurn('plant', 3.5, -3.5)

          if (!safePlaced) {
            addFurn('safe', 3.5, 3.5, Math.PI, undefined, true) 
            safePlaced = true
          }

          addFurn('painting', 2.5, 4.8, Math.PI, 'shabbat', true)
          addFurn('painting', 4.8, 0, -Math.PI / 2, undefined, true)
          break
        case 'bedroom':
        case 'guest_room':
          // Bed Vignette: Bed centered on wall + Nightstands
          addFurn('bed', 0, -2.5, 0, undefined, true)
          addFurn('table', -2, -3, 0, undefined, true) // Nightstand L
          addFurn('table', 2, -3, 0, undefined, true) // Nightstand R
          addFurn('lamp', -2, -3, 0, undefined, true) // Lamp on Nightstand L

          addFurn('rug', 0, 0.5) // Rug at foot of bed

          // Reading/Dressing Corner
          addFurn('cabinet', 3.5, 2.5, -Math.PI / 2, undefined, true)
          addFurn('chair', -3, 2.5, Math.PI / 2)

          addFurn('painting', 0, -4.8, 0, undefined, true) // Above bed
          break
        case 'kitchen':
          addFurn('fridge', 3.5, 3.5, Math.PI) // Corner
          addFurn('table', 0, 0)
          addFurn('cabinet', -3.5, 3.5, Math.PI / 2)
          addFurn('washer', -3.5, -3.5, Math.PI / 2)
          addFurn('painting', 2, -4.8, 0)
          break
        case 'bathroom':
          addFurn('toilet', 2, 3.5, Math.PI) // Back wall
          addFurn('cabinet', 3.5, -3, -Math.PI / 2) // Side wall
          addFurn('plant', -3.5, 3.5) // Corner
          addFurn('painting', -4.8, 2, Math.PI / 2)
          break
        case 'office':
          addFurn('desk', 0, 2, Math.PI)
          addFurn('chair', 0, 0, Math.PI)
          addFurn('bookshelf', -3, -3, Math.PI / 2)
          addFurn('lamp', 3, 3)
          addFurn('monitor', 0, 2, Math.PI)
          addFurn('rug', 0, 0)
          addFurn('painting', 4.8, 2, -Math.PI / 2)
          addFurn('painting', -2, -4.8, 0)
          break
        case 'library':
          // Rows of books
          addFurn('bookshelf', -2.5, -3.5, 0, undefined, true)
          addFurn('bookshelf', 2.5, -3.5, 0, undefined, true)

          addFurn('bookshelf', -3.5, 1, Math.PI / 2, undefined, true)
          addFurn('bookshelf', 3.5, 1, -Math.PI / 2, undefined, true)

          // Central reading area
          addFurn('rug', 0, 0)
          addFurn('table', 0, 0, 0, undefined, true)
          addFurn('chair', -1.5, 0, Math.PI / 2)
          addFurn('chair', 1.5, 0, -Math.PI / 2)

          addFurn('lamp', -3.5, -3.5)

          addFurn('painting', 2.5, 4.8, Math.PI, undefined, true)
          break
        case 'gym':
          addFurn('tv', -2.5, -4.8, 0) // Back Wall - Offset to clear door
          addFurn('treadmill', 3.5, 0, -Math.PI / 2)
          addFurn('bench', 0, 1) // Center
          addFurn('dumbbell', -3.5, 0) // Left Side
          addFurn('painting', 4.8, 2.5, -Math.PI / 2)
          break
        case 'garage':
          addFurn('tool_chest', 3, 3, -Math.PI / 2)
          addFurn('cabinet', -3, 3)
          addFurn('washer', -3, -3)
          addFurn('dryer', -1.5, -3)
          addFurn('painting', 2.5, -4.8, 0)
          break
        case 'pantry':
          addFurn('cabinet', -3, -2, Math.PI / 2)
          addFurn('cabinet', -3, 2, Math.PI / 2)
          addFurn('fridge', 3, 3)
          break
        case 'game_room':
          addFurn('pool_table', 0, 0)
          // Point Arcades to center (approx)
          addFurn('arcade_game', -3.5, 3.5, 3 * Math.PI / 4) // Top Left looking SE
          addFurn('arcade_game', -3.5, -3.5, Math.PI / 4) // Bottom Left looking NE
          addFurn('vending_machine', 3.5, -3.5, -3 * Math.PI / 4)
          addFurn('couch', 3, 3, Math.PI / 2)
          addFurn('painting', 4.8, 2.5, -Math.PI / 2)
          break
        case 'theater':
          addFurn('cinema_screen', 0, -4.8, 0) // Back wall
          addFurn('couch', -2, 0) // Row 1 Left
          addFurn('couch', 2, 0) // Row 1 Right
          addFurn('couch', 0, 3) // Row 2 Center
          addFurn('rug', 0, 0)
          addFurn('painting', -4.8, 2.5, Math.PI / 2)
          addFurn('painting', 4.8, 2.5, -Math.PI / 2)
          break
        case 'prayer_room':
          addFurn('bimah', 0, 0) // Center Podium
          addFurn('bookshelf', -3, -3, Math.PI / 2) // Sepharim
          addFurn('bookshelf', 3, -3, -Math.PI / 2)
          addFurn('bench', 0, 3, Math.PI) // Facing Bimah
          addFurn('bench', -3, 0, Math.PI / 2) // Side
          addFurn('bench', 3, 0, -Math.PI / 2) // Side
          addFurn('painting', 2.5, -4.8, 0, 'passover') // Mizrach
          addFurn('painting', -2.5, -4.8, 0, 'western_wall')
          break
        case 'science_lab':
          addFurn('lab_bench', 0, 0)
          addFurn('server_rack', -3.5, -3.5)
          addFurn('whiteboard', 2.5, -4.8, 0)
          addFurn('desk', 3, 3, Math.PI)
          addFurn('microscope', 0.5, 0)
          addFurn('painting', -4.8, 2, Math.PI / 2)
          break
        case 'nursery':
          addFurn('crib', -3, -3, Math.PI / 4)
          addFurn('changing_table', 3, -3, -Math.PI / 4)
          addFurn('toy_chest', 0, 3, Math.PI)
          addFurn('rug', 0, 0)
          addFurn('chair', -2, 1, Math.PI / 2) // Rocking chair equivalent
          addFurn('painting', 2.5, -4.8, 0)
          addFurn('painting', 4.8, 2.5, -Math.PI / 2)
          break
        case 'lounge':
          addFurn('bar_counter', -2, 2, Math.PI / 4)
          addFurn('stool', -1.5, 1.5)
          addFurn('stool', -2.5, 2.5)
          addFurn('jukebox', 3.5, 3.5, -3 * Math.PI / 4)
          addFurn('couch', 2, -2, -Math.PI / 4)
          addFurn('table', 0.5, -0.5)
          addFurn('painting', -4.8, -2, Math.PI / 2)
          break
        case 'observatory':
          addFurn('telescope', 0, 0)
          addFurn('rug', 0, 0) // Round rug?
          addFurn('bookshelf', -3, -3, Math.PI / 4)
          addFurn('chair', 2, 2, -Math.PI / 4)
          addFurn('painting', 2.5, -4.8, 0) // Star chart
          break
        case 'sauna':
          addFurn('sauna_bench', -3, 0, Math.PI / 2)
          addFurn('sauna_bench', 0, -3, 0)
          addFurn('heater', 3, 3)
          break
        case 'wine_cellar':
          addFurn('wine_rack', -3, 2, Math.PI / 2)
          addFurn('wine_rack', -3, -2, Math.PI / 2)
          addFurn('wine_rack', 3, 2, -Math.PI / 2)
          addFurn('barrel', 0, 0)
          addFurn('barrel', 1.5, -1.5)
          break
        case 'workshop':
          addFurn('workbench', 0, -4)
          addFurn('tool_chest', -3, 0, Math.PI / 2)
          addFurn('drill_press', 3, 3, -Math.PI / 4)
          addFurn('saw', 3, -3, -3 * Math.PI / 4)
          break
        case 'mikvah':
          addFurn('mikvah_pool', 0, 0)
          addFurn('cabinet', -3, 3) // Towels
          addFurn('bench', 3, 0, -Math.PI / 2)
          addFurn('plant', -3, -3)
          break
        case 'beit_midrash':
          addFurn('bookshelf', -3, -3, Math.PI / 4)
          addFurn('bookshelf', 3, -3, -Math.PI / 4)
          addFurn('table', -1.5, 0)
          addFurn('open_book', -1.5, 0, Math.PI / 2) // On table 1
          addFurn('chair', -2.5, 0, Math.PI / 2)
          addFurn('table', 1.5, 0)
          addFurn('torah_scroll', 1.5, 0) // On table 2
          addFurn('chair', 2.5, 0, -Math.PI / 2)
          break
        case 'sukkah':
          // Sukkah needs open roof? Not implemented yet but logic is here
          addFurn('table', 0, 0)
          addFurn('chair', 1, 0, -Math.PI / 2)
          addFurn('chair', -1, 0, Math.PI / 2)
          break 
        case 'ballroom':
          addFurn('chandelier', 0, 0)
          addFurn('piano', 3, 3, Math.PI) // Corner
          addFurn('bench', -3, -3, Math.PI / 4)
          addFurn('bench', -3, 3, -Math.PI / 4)
          break
        case 'aquarium':
          addFurn('fish_tank', -2, -4.8, 0)
          addFurn('fish_tank', 3, 0, -Math.PI / 2)
          addFurn('fish_tank', -3, 0, Math.PI / 2)
          addFurn('bench', 0, 0)
          break
        case 'trophy_room':
          addFurn('trophy_case', -3, -3, Math.PI / 4)
          addFurn('trophy_case', 3, -3, -Math.PI / 4)
          addFurn('sculpture', 0, 0)
          addFurn('painting', -4.8, 2, Math.PI / 2)
          break
        case 'bakery':
          addFurn('oven_industrial', -3, 3)
          addFurn('baker_rack', -3, -3)
          addFurn('table', 0, 0)
          addFurn('cabinet', 3, 3)
          break
        case 'hall':
          if (Math.random() > 0.7) addFurn('plant', 0, 0)
          if (Math.random() > 0.7) addFurn('bench', 3, 2.5, -Math.PI / 2)
          break
        case 'art_studio':
          addFurn('easel', 0, 0, -Math.PI / 4)
          addFurn('sculpture', 2, 2)
          addFurn('cabinet', -3, -3)
          addFurn('painting', 4.8, 2, -Math.PI / 2)
          addFurn('painting', -2.5, -4.8)
          break
        case 'music_room':
          addFurn('piano', 0, -2, Math.PI)
          addFurn('drum_kit', 3, 3, -Math.PI / 4)
          addFurn('rug', 0, 0)
          addFurn('painting', -4.8, 2.5, Math.PI / 2)
          break
      }
    })

    // --- POST PROCESSING ---

    // 1. Force Safe if not placed (e.g. small grid, random chance missed dining)
    if (!safePlaced && newRooms.length > 0) {
      const room = newRooms[0]
      const [rx, ry, rz] = room.position
      newFurniture.push({
        id: `${room.id}_safe_forced`,
        type: 'safe',
        position: [rx + 3.5, ry, rz + 3.5],
        rotation: [0, Math.PI, 0]
      })
    }

    // 2. Clear Safe Zones (Aggressive)
    const safes = newFurniture.filter(f => f.type === 'safe')
    safes.forEach(safe => {
      // Remove anything within 2m
      for (let i = newFurniture.length - 1; i >= 0; i--) {
        const f = newFurniture[i]
        if (f.id === safe.id) continue // Don't delete the safe itself

        const dx = f.position[0] - safe.position[0]
        const dz = f.position[2] - safe.position[2]
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist < 2.0) {
          newFurniture.splice(i, 1) // Remove colliding item
        }
      }
    })

    // 3. Clear Doorways (x=0, z=±5 AND z=0, x=±5 relative to room centers)
    newRooms.forEach(room => {
      const [rx, _, rz] = room.position
      const doorSpots = [
        [rx, rz + 5], [rx, rz - 5], // Z-axis doors
        [rx + 5, rz], [rx - 5, rz]  // X-axis doors
      ]

      doorSpots.forEach(([dx, dz]) => {
        for (let i = newFurniture.length - 1; i >= 0; i--) {
          const f = newFurniture[i]
          const dist = Math.sqrt(Math.pow(f.position[0] - dx, 2) + Math.pow(f.position[2] - dz, 2))
          if (dist < 1.0) {
            newFurniture.splice(i, 1)
          }
        }
      })
    })

    // 4. Fix Floating/Table Heights
    const tableItems = ['lamp', 'monitor', 'open_book', 'torah_scroll', 'microscope', 'plant', 'tv']
    const surfaces = newFurniture.filter(f => ['table', 'desk', 'cabinet', 'bar_counter', 'sauna_bench', 'workbench'].includes(f.type))

    newFurniture.forEach(f => {
      if (tableItems.includes(f.type)) {
        // Check overlap
        const surface = surfaces.find(s => {
          const dx = Math.abs(s.position[0] - f.position[0])
          const dz = Math.abs(s.position[2] - f.position[2])
          return dx < 1.0 && dz < 1.0
        })
        if (surface) {
          // Determine height based on surface type
          let height = 0.8 // Default table height
          if (surface.type === 'bar_counter') height = 1.1
          if (surface.type === 'cabinet') height = 1.0
          if (surface.type === 'desk') height = 0.8

          f.position[1] = height
        } else {
          if (['monitor', 'microscope', 'open_book', 'torah_scroll'].includes(f.type)) {
            f.position[1] = 0
          }
        }
      }
    })

    // 5. Hiding Spots
    const searchableItems = newFurniture.filter(f =>
      f.type !== 'chair' &&
      f.type !== 'safe' &&
      f.type !== 'dumbbell' &&
      f.type !== 'monitor' &&
      f.type !== 'rug' &&
      f.type !== 'sculpture'
    )

    // Clamp total pieces to available items
    // Use targetPuzzlePieces (config) instead of totalPuzzlePieces (session) to prevent degradation
    const { targetPuzzlePieces: requestedPieces } = get()
    // Ensure at least 1 piece if possible, but max is requested
    const finalCount = Math.min(requestedPieces, searchableItems.length)

    // Update store with ACTUAL total
    set({ totalPuzzlePieces: finalCount })

    const shuffled = [...searchableItems].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, finalCount)
    const hiddenMap: Record<string, boolean> = {}

    searchableItems.forEach(f => hiddenMap[f.id] = false)
    selected.forEach(f => hiddenMap[f.id] = true)

    const code = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('')

    set({
      gameState: 'playing',
      secretCode: code,
      puzzlePiecesFound: 0,
      totalPuzzlePieces: finalCount, 
      hasKey: false,
      hiddenPieces: hiddenMap,
      foundLocations: {},
      rooms: newRooms,
      furniture: newFurniture,
      // Metrics Reset
      startTime: Date.now(),
      elapsedTime: 0,
      furnitureSearched: 0
    })
  },
  searchLocation: (id: string) => set((state) => {
    if (state.gameState !== 'playing') return {}
    if (state.foundLocations[id]) return {}

    const hasPiece = state.hiddenPieces[id]

    return {
      foundLocations: { ...state.foundLocations, [id]: true },
      puzzlePiecesFound: hasPiece ? state.puzzlePiecesFound + 1 : state.puzzlePiecesFound,
      furnitureSearched: state.furnitureSearched + 1
    }
  })
}))
