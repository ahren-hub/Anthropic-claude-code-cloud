import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import ProjectModal from './ProjectModal'

const CATEGORY_COLORS = {
  software: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  business: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  content: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  personal: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
}

const CATEGORY_LABELS = {
  software: 'Software',
  business: 'Business',
  content: 'Content',
  personal: 'Personal',
}

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  'on-hold': { label: 'On Hold', color: 'text-amber-400', dot: 'bg-amber-400' },
  done: { label: 'Done', color: 'text-zinc-500', dot: 'bg-zinc-500' },
}

export default function Projects() {
  const [projects, setProjects] = useLocalStorage('projects', [])
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const counts = {
    all: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    'on-hold': projects.filter((p) => p.status === 'on-hold').length,
    done: projects.filter((p) => p.status === 'done').length,
  }

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter)

  const save = (data) => {
    if (editing) {
      setProjects((prev) => prev.map((p) => (p.id === editing.id ? { ...editing, ...data } : p)))
    } else {
      setProjects((prev) => [
        ...prev,
        { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() },
      ])
    }
    setEditing(null)
    setModalOpen(false)
  }

  const remove = (id) => {
    if (confirm('Delete this project?')) {
      setProjects((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const openEdit = (project) => {
    setEditing(project)
    setModalOpen(true)
  }

  const openAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const FILTERS = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'active', label: `Active (${counts.active})` },
    { key: 'on-hold', label: `On Hold (${counts['on-hold']})` },
    { key: 'done', label: `Done (${counts.done})` },
  ]

  return (
    <div className="p-4 space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-3">
        <h1 className="text-2xl font-bold text-zinc-100">Projects</h1>
        <button
          onClick={openAdd}
          className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xl leading-none hover:bg-purple-400 active:scale-95 transition-all"
        >
          +
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === key
                ? 'bg-purple-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Projects list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-semibold text-zinc-300">No projects here</p>
          <p className="text-sm mt-2">Tap + to add your first project</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => {
            const cat = CATEGORY_COLORS[project.category] || 'bg-zinc-800 text-zinc-400 border-zinc-700'
            const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.active
            return (
              <div
                key={project.id}
                className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
                        <span className={`text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <h3 className="font-semibold text-zinc-100 leading-snug">{project.name}</h3>
                      {project.description && (
                        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${cat}`}
                    >
                      {CATEGORY_LABELS[project.category] || project.category}
                    </span>
                  </div>

                  {project.nextAction && (
                    <div className="flex items-start gap-2 text-xs bg-zinc-800/50 rounded-xl p-2.5">
                      <span className="text-purple-400 mt-px">→</span>
                      <span className="text-zinc-300">{project.nextAction}</span>
                    </div>
                  )}
                </div>

                <div className="flex border-t border-zinc-800">
                  <button
                    onClick={() => openEdit(project)}
                    className="flex-1 py-2.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
                  >
                    Edit
                  </button>
                  <div className="w-px bg-zinc-800" />
                  <button
                    onClick={() => remove(project.id)}
                    className="flex-1 py-2.5 text-xs text-red-400/60 hover:text-red-400 hover:bg-zinc-800/50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <ProjectModal initial={editing} onSave={save} onClose={() => setModalOpen(false)} />
      )}
    </div>
  )
}
