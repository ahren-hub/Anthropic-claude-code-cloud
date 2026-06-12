import { useState } from 'react'

const CATEGORIES = [
  { value: 'software', label: 'Software Build', emoji: '💻' },
  { value: 'business', label: 'Business Venture', emoji: '🚀' },
  { value: 'content', label: 'Content / Marketing', emoji: '📣' },
  { value: 'personal', label: 'Personal Goal', emoji: '🎯' },
]

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'done', label: 'Done' },
]

export default function ProjectModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    category: initial?.category || 'software',
    status: initial?.status || 'active',
    description: initial?.description || '',
    nextAction: initial?.nextAction || '',
  })

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-zinc-900 rounded-t-3xl border-t border-zinc-700 p-5 max-h-[90vh] overflow-y-auto"
        style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-bold text-zinc-100 mb-5">
          {initial ? 'Edit Project' : 'New Project'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Project name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Shortlist Studio"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />
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
                  className={`p-3 rounded-xl text-sm text-left border transition-all ${
                    form.category === cat.value
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <span className="mr-2">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Status</label>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => set('status', s.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                    form.status === s.value
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Next Action */}
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Next action</label>
            <input
              type="text"
              value={form.nextAction}
              onChange={(e) => set('nextAction', e.target.value)}
              placeholder="e.g. Launch MVP on Product Hunt"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Notes (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Goals, context, or anything worth tracking..."
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
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
              {initial ? 'Save Changes' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
