import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import HabitModal from './HabitModal'
import { last7Days, dayLabel } from '../utils/dates'
import { calculateStreak } from '../utils/streaks'
import { DEFAULT_HABITS } from '../data/defaults'

export default function Habits() {
  const [habits, setHabits] = useLocalStorage('habits', DEFAULT_HABITS)
  const [logs] = useLocalStorage('habitLogs', {})
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const days = last7Days()

  const save = (data) => {
    if (editing) {
      setHabits((prev) => prev.map((h) => (h.id === editing.id ? { ...editing, ...data } : h)))
    } else {
      setHabits((prev) => [...prev, { ...data, id: Date.now().toString() }])
    }
    setEditing(null)
    setModalOpen(false)
  }

  const remove = (id) => {
    if (confirm('Delete this habit?')) {
      setHabits((prev) => prev.filter((h) => h.id !== id))
    }
  }

  const openEdit = (habit) => {
    setEditing(habit)
    setModalOpen(true)
  }

  const openAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }

  return (
    <div className="p-4 space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-3">
        <h1 className="text-2xl font-bold text-zinc-100">My Habits</h1>
        <button
          onClick={openAdd}
          className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xl leading-none hover:bg-purple-400 active:scale-95 transition-all"
        >
          +
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-5xl mb-4">✨</p>
          <p className="font-semibold text-zinc-300">No habits yet</p>
          <p className="text-sm mt-2">Tap + to add your first habit</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const streak = calculateStreak(logs, habit.id)
            return (
              <div
                key={habit.id}
                className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  {/* Habit header */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl leading-none">{habit.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-zinc-100 truncate">{habit.name}</p>
                      {streak > 0 && (
                        <p className="text-xs text-amber-400 mt-0.5">🔥 {streak} day streak</p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEdit(habit)}
                        className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(habit.id)}
                        className="px-2 py-1 text-xs text-red-400/60 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* 7-day tracker */}
                  <div className="flex gap-1.5">
                    {days.map((day, i) => {
                      const done = !!logs[day]?.[habit.id]
                      const isToday = i === days.length - 1
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs text-zinc-600">{dayLabel(day)}</span>
                          <div
                            className={`w-full rounded-lg flex items-center justify-center transition-all ${
                              done
                                ? 'bg-purple-500'
                                : isToday
                                ? 'bg-zinc-700 ring-1 ring-purple-500/50'
                                : 'bg-zinc-800'
                            }`}
                            style={{ aspectRatio: '1' }}
                          >
                            {done && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <HabitModal initial={editing} onSave={save} onClose={() => setModalOpen(false)} />
      )}
    </div>
  )
}
