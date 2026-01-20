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
  setTotalPieces: (count) => set({ totalPuzzlePieces: count }),
  registerLocation: () => { },
  resetGame: () => {
    const { gridSize } = get()
    // 1. Generate Rooms on a Grid
    const newRooms: RoomData[] = []
    const newFurniture: FurnitureItem[] = []

    // Expanded Grid: 4x4 or 5x5
    const spacing = 10
    const roomTypes = ['living', 'dining', 'bedroom', 'kitchen', 'bathroom', 'office', 'gym', 'library', 'guest_room', 'pantry', 'garage', 'art_studio', 'music_room', 'tech_lab']
    const colors: Record<string, string> = {
      living: '#f0e68c',
      dining: '#cd853f',
      bedroom: '#e9967a',
      kitchen: '#add8e6',
      bathroom: '#ffffff',
      hall: '#d3d3d3',
      office: '#deb887',
      gym: '#b0c4de',
      library: '#8b4513',
      guest_room: '#ffa07a',
      pantry: '#fffacd',
      garage: '#696969',
      art_studio: '#dda0dd',
      music_room: '#20b2aa',
      tech_lab: '#708090'
    }

    let hasDining = false
    const center = Math.floor(gridSize / 2)

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        let type: any = 'hall'

        const rand = Math.random()
        if (rand < 0.2) type = 'bedroom'
        else if (rand < 0.3) type = 'bathroom'
        else if (rand < 0.35) type = 'office'
        else if (rand < 0.4) type = 'library'
        else if (rand < 0.45) type = 'tech_lab'
        else if (rand < 0.5) type = 'art_studio'
        else type = roomTypes[Math.floor(Math.random() * (roomTypes.length))]

        // Center room
        if (x === center && z === center) type = 'living'

        // Dining logic
        if (!hasDining && type !== 'hall' && type !== 'living' && type !== 'bathroom') {
          if (Math.random() > 0.8 || (x === gridSize - 1 && z === gridSize - 1)) {
            type = 'dining'
            hasDining = true
          }
        }

        newRooms.push({
          id: `room_${x}_${z}`,
          position: [(x - center) * spacing, 0, (z - center) * spacing],
          type: type,
          color: colors[type] || '#ccc'
        })
      }
    }

    // Fallback guarantees
    if (!hasDining) newRooms.find(r => r.type !== 'living')!.type = 'dining'

    // 2. Generate Furniture per Room
    newRooms.forEach(room => {
      const [rx, ry, rz] = room.position

      const addFurn = (type: FurnitureItem['type'], lx: number, lz: number, rotY = 0) => {
        let variant: string | undefined = undefined
        if (type === 'painting') {
          const rand = Math.random()
          if (rand > 0.6) variant = 'passover'
          else if (rand > 0.3) variant = 'western_wall'
          else variant = undefined
        }
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
          addFurn('couch', 2.5, -3) // Back wall
          // Randomize couch color sometimes
          if (Math.random() > 0.5) newFurniture[newFurniture.length - 1].color = '#8B4513' // Leather brown
          else newFurniture[newFurniture.length - 1].color = '#556B2F' // Olive green

          addFurn('tv', 2.5, 3.5, Math.PI) // Front wall
          addFurn('table', 0, 0)
          addFurn('lamp', -3.5, 3.5)
          addFurn('plant', 3.5, 2.0)
          if (Math.random() > 0.5) addFurn('bookshelf', -3.5, -2, Math.PI / 2)
          addFurn('rug', 0, 0)
          addFurn('painting', 2.5, -4.8) // Offset from center
          addFurn('painting', -4.8, 2.5, Math.PI / 2) // Side wall offset
          break
        case 'dining':
          addFurn('table', 0, 0)
          // Chairs tuck in
          addFurn('chair', -1, 0, Math.PI / 2)
          addFurn('chair', 1, 0, -Math.PI / 2)
          addFurn('chair', 0, -1, 0)
          addFurn('chair', 0, 1, Math.PI)
          addFurn('cabinet', -3, 3.5, Math.PI)
          addFurn('safe', 3.5, 3.5, Math.PI) // The Safe
          addFurn('painting', -4.8, 2, Math.PI / 2)
          break
        case 'bedroom':
        case 'guest_room':
          addFurn('bed', 2.5, -2.5) // Moved to side
          addFurn('lamp', -3.5, -3.5) // Opposite corner
          addFurn('cabinet', -3.5, 3, Math.PI / 2) // Side wall
          addFurn('plant', 3.5, 2)
          addFurn('rug', 0, 0)
          addFurn('painting', 2.5, -4.8) // Above bed, offset
          break
        case 'kitchen':
          addFurn('fridge', 3.5, 3.5, Math.PI) // Corner
          addFurn('table', 0, 0)
          addFurn('cabinet', -3.5, 3.5, Math.PI / 2)
          addFurn('washer', -3.5, -3.5, Math.PI / 2)
          break
        case 'bathroom':
          addFurn('toilet', 2, 3.5, Math.PI) // Back wall
          addFurn('cabinet', 3.5, -3, -Math.PI / 2) // Side wall
          addFurn('plant', -3.5, 3.5) // Corner
          break
        case 'office':
          addFurn('desk', 0, 2, Math.PI)
          addFurn('chair', 0, 0, Math.PI)
          addFurn('bookshelf', -3, -3, Math.PI / 2)
          addFurn('lamp', 3, 3)
          addFurn('monitor', 0, 2, Math.PI)
          addFurn('rug', 0, 0)
          addFurn('painting', 4.8, 2, -Math.PI / 2)
          break
        case 'library':
          addFurn('bookshelf', -3, -2, Math.PI / 2)
          addFurn('bookshelf', -3, 2, Math.PI / 2)
          addFurn('bookshelf', 3, -2, -Math.PI / 2)
          addFurn('chair', 0, 0)
          addFurn('table', 0, 1.5)
          addFurn('lamp', 0, -2)
          addFurn('rug', 0, 0)
          break
        case 'gym':
          addFurn('treadmill', 2, 0, -Math.PI / 2)
          addFurn('dumbbell', -2, 0)
          addFurn('bench', 0, 0)
          addFurn('tv', 3, 3.5, Math.PI)
          break
        case 'garage':
          addFurn('tool_chest', 3, 3, -Math.PI / 2)
          addFurn('cabinet', -3, 3)
          addFurn('washer', -3, -3)
          addFurn('dryer', -1.5, -3)
          break
        case 'pantry':
          addFurn('cabinet', -3, -2, Math.PI / 2)
          addFurn('cabinet', 3, -2, -Math.PI / 2)
          addFurn('fridge', 2.5, 3, Math.PI)
          break
        case 'hall':
          if (Math.random() > 0.7) addFurn('plant', 0, 0)
          if (Math.random() > 0.7) addFurn('bench', 3, 2.5, -Math.PI / 2)
          addFurn('painting', -4.8, 2.5, Math.PI / 2) // Art in hall
          break
        case 'tech_lab':
          addFurn('server_rack', -3, -3)
          addFurn('server_rack', -3, 3)
          addFurn('desk', 0, 0)
          addFurn('monitor', 0, 0, Math.PI)
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

    // 3. Hiding Spots
    const searchableItems = newFurniture.filter(f =>
      f.type !== 'chair' &&
      f.type !== 'safe' &&
      f.type !== 'dumbbell' &&
      f.type !== 'monitor' &&
      f.type !== 'rug' &&
      f.type !== 'sculpture'
    )

    // Clamp total pieces to available items
    const { totalPuzzlePieces: requestedPieces } = get()
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

    // Check if we just found the LAST piece?
    // Actually timer stops at 'won' state which is set in UI when safe opens.
    // But requirement says: "timer that tracks how long it takes to get all the puzzle pieces"
    // AND "to victory screen".
    // Usually "Time to Find Pieces" is one metric, "Total Time" is another?
    // "how long it takes to get all the puzzle pieces to the lower right" -> maybe meant "displayed in lower right"?
    // "and to the victory screen"
    // Let's assume one timer: Total Game Time.

    return {
      foundLocations: { ...state.foundLocations, [id]: true },
      puzzlePiecesFound: hasPiece ? state.puzzlePiecesFound + 1 : state.puzzlePiecesFound,
      furnitureSearched: state.furnitureSearched + 1
    }
  })
}))
