import { Canvas } from '@react-three/fiber'
import { Setup } from './components/World/Setup'
import { Game } from './components/Game'
import { UI } from './components/UI/UI'

import { BackgroundMusic } from './components/FX/BackgroundMusic'
import { SoundEffects } from './components/FX/SoundEffects'
import { useGameStore } from './store/gameStore'

function App() {
  const isMusicEnabled = useGameStore(state => state.isMusicEnabled)

  return (
    <>
      <BackgroundMusic enabled={isMusicEnabled} />
      <SoundEffects enabled={isMusicEnabled} />
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 75 }}>
        <Setup />
        <Game />
      </Canvas>
      <UI />
    </>
  )
}

export default App
