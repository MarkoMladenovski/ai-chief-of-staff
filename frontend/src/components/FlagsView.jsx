const URGENCY = {
  critical: {
    bar: 'border-l-red-500',
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-700',
    label: '🚨 Critical',
    order: 0,
  },
  high: {
    bar: 'border-l-orange-500',
    bg: 'bg-orange-50',
    badge: 'bg-orange-100 text-orange-700',
    label: '⚠️ High',
    order: 1,
  },
  medium: {
    bar: 'border-l-yellow-500',
    bg: 'bg-yellow-50',
    badge: 'bg-yellow-100 text-yellow-700',
    label: '📌 Medium',
    order: 2,
  },
}

function displayName(from = '') {
  const match = from.match(/^([^<]+)</)
  return (match ? match[1].trim() : from).split('(')[0].trim()
}

export default function FlagsView({ flags, messages }) {
  const msgMap = Object.fromEntries(messages.map(m => [m.id, m]))

  const sorted = [...flags].sort(
    (a, b) => (URGENCY[a.urgency]?.order ?? 99) - (URGENCY[b.urgency]?.order ?? 99)
  )

  if (sorted.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-4xl mb-3">✅</p>
        <p className="font-medium">No flags today</p>
        <p className="text-sm mt-1">Your morning looks clean.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sorted.map((flag, i) => {
        const u = URGENCY[flag.urgency] ?? URGENCY.medium
        return (
          <div
            key={i}
            className={`${u.bg} border border-l-4 ${u.bar} rounded-xl p-5 shadow-sm`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-slate-900 text-base leading-snug">{flag.title}</h3>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap flex-shrink-0 ${u.badge}`}>
                {u.label}
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed mb-3">{flag.description}</p>
            {flag.related_message_ids?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {flag.related_message_ids.map(id => {
                  const msg = msgMap[id]
                  if (!msg) return null
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 text-xs bg-white/80 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200"
                    >
                      <span className="text-slate-400">#{id}</span>
                      {displayName(msg.from)}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
