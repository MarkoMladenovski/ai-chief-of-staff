import { useState } from 'react'
import MessageCard from './MessageCard'

const FILTERS = ['All', 'Decide', 'Delegate', 'Ignore']

const URGENCY_RANK = { critical: 0, high: 1, medium: 2, low: 3 }
const CATEGORY_RANK = { decide: 0, delegate: 1, ignore: 2 }

export default function TriageView({ triage, messages }) {
  const [filter, setFilter] = useState('All')

  const msgMap = Object.fromEntries(messages.map(m => [m.id, m]))

  const filtered = triage
    .filter(t => filter === 'All' || t.category === filter.toLowerCase())
    .sort((a, b) =>
      CATEGORY_RANK[a.category] - CATEGORY_RANK[b.category] ||
      URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency]
    )

  const counts = {
    All: triage.length,
    Decide: triage.filter(t => t.category === 'decide').length,
    Delegate: triage.filter(t => t.category === 'delegate').length,
    Ignore: triage.filter(t => t.category === 'ignore').length,
  }

  const filterStyles = {
    All: { active: 'bg-indigo-100 text-indigo-700 border-indigo-200', inactive: '' },
    Decide: { active: 'bg-red-100 text-red-700 border-red-200', inactive: '' },
    Delegate: { active: 'bg-amber-100 text-amber-700 border-amber-200', inactive: '' },
    Ignore: { active: 'bg-slate-200 text-slate-600 border-slate-300', inactive: '' },
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f
                ? filterStyles[f].active
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            {f}
            <span className="ml-1.5 opacity-70 text-xs">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(t => (
          <MessageCard key={t.id} triage={t} message={msgMap[t.id]} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-slate-400 py-12">No messages in this category.</p>
        )}
      </div>
    </div>
  )
}
