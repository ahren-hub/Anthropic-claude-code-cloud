import { useLocalStorage } from '../hooks/useLocalStorage'
import { today, formatDate, greet } from '../utils/dates'
import { calculateStreak } from '../utils/streaks'
import { DEFAULT_HABITS } from '../data/defaults'

const CATEGORY_COLORS = {
  software: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  business: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  content: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  personal: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
}

export default function Today() {
  const [habits] = useLocalStorage('habits', DEFAULT_HABITS)
  const [logs, setLogs] = useLocalStorage('habitLogs', {})
  const [projects] = useLocalStorage('projects', [])

  const todayStr = today()
  const todayLogs = logs[todayStr] || {}

  const toggle = (habitId) => {
    setLogs((prev) => ({
      ...prev,
      [todayStr]: {
        ...(prev[todayStr] || {}),
        [habitId]: !prev[todayStr]?.[habitId],
      },
    }))
  }

  const completed = habits.filter((h) => todayLogs[h.id]).length
  const total = habits.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  const activeProjects = projects.filter((p) => p.status === 'active').slice(0, 3)

  return (
    <div className="p-4 space-y-6 pb-6">
      {/* Header */}
      <div className="pt-3">
        <p className="text-zinc-500 text-sm">{formatDate(todayStr)}</p>
        <h1 className="text-2xl font-bold mt-0.5 text-zinc-100">{greet()}, Ahren</h1>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-400">Today&apos;s progress</span>
            <span className="text-sm font-bold text-purple-400">{pct}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600 mt-2">
            {completed} of {total} habits done
          </p>
        </div>
      )}

      {/* Habits checklist */}
      {habits.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Daily Habits
          </h2>
          <div className="space-y-2">
            {habits.map((habit) => {
              const done = !!todayLogs[habit.id]
              const streak = calculateStreak(logs, habit.id)
              return (
                <button
                  key={habit.id}
                  onClick={() => toggle(habit.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all active:scale-95 ${
                    done
                      ? 'bg-purple-500/10 border-purple-500/30'
                      : 'bg-zinc-900 border-zinc-800 active:bg-zinc-800'
                  }`}
                >
                  <span className="text-xl leading-none">{habit.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-sm truncate ${
                        done ? 'text-zinc-500 line-through' : 'text-zinc-100'
                      }`}
                    >
                      {habit.name}
                    </p>
                    {streak > 0 && (
                      <p className="text-xs text-amber-400 mt-0.5">🔥 {streak} day streak</p>
                    )}
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      done ? 'bg-purple-500 border-purple-500' : 'border-zinc-600'
                    }`}
                  >
                    {done && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Active projects snapshot */}
      {activeProjects.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Active Projects
          </h2>
          <div className="space-y-2">
            {activeProjects.map((project) => (
              <div
                key={project.id}
                className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-zinc-100 truncate">{project.name}</p>
                    {project.nextAction && (
                      <p className="text-xs text-zinc-500 mt-1 truncate">→ {project.nextAction}</p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
                      CATEGORY_COLORS[project.category] || 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {project.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {habits.length === 0 && projects.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-5xl mb-4">🚀</p>
          <p className="font-semibold text-zinc-300">Let&apos;s get started</p>
          <p className="text-sm mt-2">Add habits and projects using the tabs below</p>
        </div>
      )}
    </div>
  )
}
