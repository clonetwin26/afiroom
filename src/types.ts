export type GameState = 'intro' | 'playing' | 'puzzle_assembly' | 'unlocked' | 'safe_interaction' | 'won'

// Room Type
export interface RoomData {
  id: string
  position: [number, number, number]
  type: 'living' | 'dining' | 'bedroom' | 'kitchen' | 'bathroom' | 'hall' | 'office' | 'gym' | 'library' | 'pantry' | 'garage' | 'guest_room' | 'art_studio' | 'music_room' | 'tech_lab'
  color: string
}

export interface FurnitureItem {
  id: string
  type: 'tv' | 'fireplace' | 'toilet' | 'safe' | 'bookshelf' | 'plant' | 'couch' | 'table' | 'chair' | 'bed' | 'lamp' | 'fridge' | 'cabinet' | 'desk' | 'monitor' | 'dumbbell' | 'treadmill' | 'piano' | 'bench' | 'tool_chest' | 'washer' | 'dryer' | 'server_rack' | 'easel' | 'drum_kit' | 'rug' | 'sculpture'
  position: [number, number, number]
  rotation: [number, number, number]
  color?: string
}

export interface GameStore {
  gameState: GameState
  secretCode: string
  puzzlePiecesFound: number
  totalPuzzlePieces: number
  hasKey: boolean
  gridSize: number
  joystickInput: { x: number, y: number }
  lookStickInput: { x: number, y: number }
  lookInput: { x: number, y: number }
  hoveredId: string | null
  notification: string | null
  isMusicEnabled: boolean
  isGyroEnabled: boolean
  timeOfDay: 'day' | 'night'

  hiddenPieces: Record<string, boolean>
  foundLocations: Record<string, boolean>

  rooms: RoomData[]
  furniture: FurnitureItem[]

  // Metrics
  startTime: number
  elapsedTime: number
  furnitureSearched: number

  // Actions
  setGameState: (state: GameState) => void
  resetGame: () => void
  registerLocation: (id: string, hasPiece: boolean) => void
  searchLocation: (id: string) => void
  setGridSize: (size: number) => void
  setJoystickInput: (input: { x: number, y: number }) => void
  setLookStickInput: (input: { x: number, y: number }) => void
  setLookInput: (input: { x: number, y: number }) => void
  addLookInput: (input: { x: number, y: number }) => void
  setHoveredId: (id: string | null) => void
  showNotification: (msg: string) => void
  toggleMusic: () => void
  toggleGyro: () => void
  setTotalPieces: (count: number) => void
}
