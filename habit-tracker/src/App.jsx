import { useState } from 'react'
import Today from './components/Today'
import Projects from './components/Projects'
import Habits from './components/Habits'
import BottomNav from './components/BottomNav'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('today')

  return (
    <div className="h-dvh bg-zinc-950 text-zinc-100 flex flex-col max-w-md mx-auto">
      <main className="flex-1 overflow-y-auto">
        {tab === 'today' && <Today />}
        {tab === 'projects' && <Projects />}
        {tab === 'habits' && <Habits />}
      </main>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}
