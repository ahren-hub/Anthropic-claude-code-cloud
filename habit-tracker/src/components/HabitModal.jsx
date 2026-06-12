import { useState } from 'react'

const EMOJIS = [
  '✨', '💧', '📚', '🤝', '🎯', '💪', '🧘', '✍️',
  '🧠', '☀️', '🌙', '💊', '🍎', '📝', '📞', '🔥',
  '⚡', '🎨', '🎵', '💰', '🌿', '🏃', '😴', '🧹',
]

const CATEGORIES = [
  { value: 'health', label: 'Health' },
  { value: 'business', label: 'Business' },
  { value: 'learning', label: 'Learning' },
  { value: 'mindset', label: 'Mindset' },
]

export default function HabitModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    emoji: initial?.emoji || '✨',
    category: initial?.category || 'health',
  })

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full max-w-md mx-auto bg-zinc-900 rounded-t-3xl border-t border-zinc-700 p-5"
        style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-bold text-zinc-100 mb-5">
          {initial ? 'Edit Habit' : 'New Habit'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Habit name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Drink 8 glasses of water"
              maxLength={100}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Emoji picker */}
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Icon</label>
            <div className="grid grid-cols-8 gap-1.5">
              {EMOJIS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => set('emoji', e)}
                  className={`aspect-square rounded-xl text-xl flex items-center justify-center border transition-all ${
                    form.emoji === e
                      ? 'bg-purple-500/20 border-purple-500/50'
                      : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => set('category', cat.value)}
                  className={`py-2.5 rounded-xl text-sm border transition-all ${
                    form.category === cat.value
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-zinc-700 text-sm text-zinc-400 hover:border-zinc-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-purple-400 active:scale-95 transition-all"
            >
              {initial ? 'Save Changes' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
