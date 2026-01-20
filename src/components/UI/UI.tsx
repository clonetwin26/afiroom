import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Joystick } from './Joystick'
import { TouchControls } from './TouchControls'

export const UI = () => {
  const gameState = useGameStore(state => state.gameState)
  const setGameState = useGameStore(state => state.setGameState)
  const puzzlePiecesFound = useGameStore(state => state.puzzlePiecesFound)
  const totalPuzzlePieces = useGameStore(state => state.totalPuzzlePieces)
  const resetGame = useGameStore(state => state.resetGame)
  const secretCode = useGameStore(state => state.secretCode)
  const setGridSize = useGameStore(state => state.setGridSize)
  const setJoystickInput = useGameStore(state => state.setJoystickInput)

  const [enteredCode, setEnteredCode] = useState('')
  const [size, setSize] = useState(5)
  const [piecesCount, setPiecesCount] = useState(5)
  const [showHelp, setShowHelp] = useState(false)

  const notification = useGameStore(state => state.notification)
  const showNotification = useGameStore(state => state.showNotification)

  useEffect(() => {
    if (puzzlePiecesFound > 0) {
      showNotification('Puzzle Piece Found!')
    }
  }, [puzzlePiecesFound])

  const handleStart = () => {
    setGridSize(size)
    useGameStore.getState().setTotalPieces(piecesCount)
    setEnteredCode('') // Clear any previous safe input
    resetGame()
  }

  useEffect(() => {
    // Mobile prevent default zoom/scroll
    document.addEventListener('gesturestart', function (e) { e.preventDefault() })
  }, [])

  const toggleMusic = useGameStore(state => state.toggleMusic)
  const isMusicEnabled = useGameStore(state => state.isMusicEnabled)

  const MusicButton = () => (
    <button
      onClick={toggleMusic}
      style={{
        position: 'absolute', top: '20px', right: '20px',
        padding: '10px', fontSize: '20px', cursor: 'pointer', zIndex: 2000,
        background: 'rgba(0,0,0,0.5)', border: '2px solid white', borderRadius: '50%',
        width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white'
      }}
    >
      {isMusicEnabled ? '🔊' : '🔇'}
    </button>
  )

  return (
    <>
      <MusicButton />


      {gameState === 'intro' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.8)', color: 'white', fontFamily: 'Arial',
          zIndex: 1500
        }}>
          <h1>Passover Puzzle: Mansion Edition</h1>
          <p>Use WASD or Joystick to move. Click to search furniture.</p>
          <p>Find 5 afikoman pieces to get the safe code.</p>

          {/* Resume Button */}
          {useGameStore.getState().rooms.length > 0 && (
            <button
              onClick={() => setGameState('playing')}
              style={{
                padding: '10px 20px', fontSize: '20px', cursor: 'pointer', marginBottom: '10px',
                background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px'
              }}
            >
              Resume Game
            </button>
          )}

          <div style={{ margin: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label>House Size: {size}x{size}</label>
              <input
                type="range"
                min="2"
                max="5"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label>Puzzle Pieces: {piecesCount}</label>
              <input
                type="range"
                min="1"
                max="20"
                value={piecesCount}
                onChange={(e) => setPiecesCount(parseInt(e.target.value))}
              />
            </div>
          </div>

          <button
            style={{ padding: '10px 20px', fontSize: '20px', cursor: 'pointer', marginBottom: '10px' }}
            onClick={handleStart}
          >
            Start Search
          </button>
          <button onClick={() => setShowHelp(true)} style={{ padding: '5px 10px' }}>How to Play</button>

          {showHelp && (
            <div style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: '#333', padding: '20px', borderRadius: '10px', maxWidth: '300px', border: '2px solid white'
            }}>
              <h3>How to Play</h3>
              <p>1. Move around the mansion.</p>
              <p>2. Click on furniture (Couch, Cabinets, Beds, etc.) to search for pieces.</p>
              <p>3. Find 5 pieces to reveal the Secret Code.</p>
              <p>4. Go to the Safe (in the Dining Room or random room) and enter the code to win!</p>
              <button onClick={() => setShowHelp(false)} style={{ marginTop: '10px' }}>Close</button>
            </div>
          )}
        </div>
      )
      }

      {gameState === 'playing' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'Arial' }}>
            <h2>Pieces Found: {puzzlePiecesFound} / {totalPuzzlePieces}</h2>
            {puzzlePiecesFound === totalPuzzlePieces && (
              <h3 style={{ color: 'gold' }}>Secret Code: {secretCode}</h3>
            )}
            <button
              style={{ marginTop: '10px', pointerEvents: 'auto', padding: '5px 10px' }}
              onClick={(e) => {
                e.stopPropagation()
                setGameState('intro')
              }}
            >
              Menu / Reset
            </button>
            <button
              style={{ marginTop: '10px', marginLeft: '10px', pointerEvents: 'auto', padding: '5px 10px' }}
              onClick={() => setShowHelp(true)}
            >
              Help
            </button>
          </div>



          {/* Crosshair */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', width: '10px', height: '10px',
            background: 'white', borderRadius: '50%', transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 4px black', pointerEvents: 'none', zIndex: 50
          }} />

          {/* Left Joystick (Move) */}
          <div style={{ pointerEvents: 'auto' }}>
            <Joystick onMove={(x, y) => setJoystickInput({ x, y })} style={{ bottom: '50px', left: '50px' }} />
          </div>

          {/* Touch Controls (Invisible Layer) */}
          <TouchControls />

          {showHelp && (
            <div style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: '#333', padding: '20px', borderRadius: '10px', maxWidth: '300px', border: '2px solid white',
              color: 'white', pointerEvents: 'auto'
            }}>
              <h3>How to Play</h3>
              <p>1. Move using WASD or Joystick.</p>
              <p>2. Click furniture up close to search.</p>
              <p>3. Colors: White Ring = Searchable, Red Ring = Already Searched.</p>
              <p>4. Find 5 pieces for the code.</p>
              <button onClick={() => setShowHelp(false)} style={{ marginTop: '10px' }}>Close</button>
            </div>
          )}
        </div>
      )}

      {gameState === 'safe_interaction' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.8)', color: 'white', zIndex: 2000, pointerEvents: 'auto'
        }}>
          <h2>Enter Code</h2>
          <input
            type="text"
            value={enteredCode}
            readOnly
            style={{ fontSize: '30px', textAlign: 'center', marginBottom: '20px' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
              <button key={n} onClick={() => setEnteredCode(p => p + n)} style={{ padding: '20px', fontSize: '24px' }}>{n}</button>
            ))}
            <button onClick={() => setEnteredCode('')} style={{ background: 'red', color: 'white' }}>CLR</button>
            <button onClick={() => {
              if (enteredCode === secretCode) setGameState('won')
              else {
                setEnteredCode('')
                showNotification('Access Denied!')
              }
            }} style={{ background: 'green', color: 'white' }}>OK</button>
          </div>
          <button style={{ marginTop: '20px' }} onClick={(e) => {
            e.stopPropagation()
            setGameState('playing')
          }}>Cancel</button>
        </div>
      )}

      {/* Global Notification Overlay */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        color: '#ff4444', fontSize: '40px', fontWeight: 'bold',
        textShadow: '0 0 10px #000', pointerEvents: 'none', zIndex: 3000,
        opacity: notification ? 1 : 0, transition: 'opacity 0.5s ease-in-out'
      }}>
        {notification}
      </div>

      {gameState === 'won' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(50,205,50,0.5)', color: 'white', backdropFilter: 'blur(2px)'
        }}>
          <h1>YOU WON!</h1>
          <p>Happy Passover!</p>
          <button onClick={() => setGameState('intro')} style={{ padding: '20px', marginTop: '20px' }}>Play Again</button>
        </div>
      )}
    </>
  )
}
