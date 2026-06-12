import { useState } from 'react'
import Today from './components/Today'
import Projects from './components/Projects'
import Habits from './components/Habits'
import BottomNav from './components/BottomNav'
import { useLocalStorage } from './hooks/useLocalStorage'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('today')
  // Monitor any key for storage write failures; surface a warning banner
  const [, , storageError] = useLocalStorage('__health__', true)

  return (
    <div className="h-dvh bg-zinc-950 text-zinc-100 flex flex-col max-w-md mx-auto">
      {storageError && (
        <div className="flex-shrink-0 bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-300 text-center">
          ⚠️ Storage full — data may not be saving. Free up browser storage.
        </div>
      )}
      <main className="flex-1 overflow-y-auto">
        {tab === 'today' && <Today />}
        {tab === 'projects' && <Projects />}
        {tab === 'habits' && <Habits />}
      </main>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}
