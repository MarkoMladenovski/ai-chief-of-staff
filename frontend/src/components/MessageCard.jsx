import { useState } from 'react'

const CATEGORY = {
  decide: {
    badge: 'bg-red-100 text-red-700',
    bar: 'bg-red-500',
    border: 'border-red-200',
    ring: 'hover:border-red-300',
  },
  delegate: {
    badge: 'bg-amber-100 text-amber-700',
    bar: 'bg-amber-500',
    border: 'border-amber-200',
    ring: 'hover:border-amber-300',
  },
  ignore: {
    badge: 'bg-slate-100 text-slate-500',
    bar: 'bg-slate-300',
    border: 'border-slate-200',
    ring: 'hover:border-slate-300',
  },
}

const URGENCY_DOT = {
  critical: 'bg-red-500',
  high: 'bg-orange-400',
  medium: 'bg-yellow-400',
  low: 'bg-green-400',
}

const CHANNEL_ICON = { email: '✉️', slack: '💬', whatsapp: '📱' }

function displayName(from = '') {
  const match = from.match(/^([^<]+)</)
  return match ? match[1].trim() : from
}

function messageTitle(msg) {
  if (!msg) return ''
  if (msg.subject) return msg.subject
  if (msg.channel_name) return `#${msg.channel_name}`
  return ''
}

function bodyPreview(body = '', len = 130) {
  const clean = body.replace(/\n+/g, ' ').trim()
  return clean.length > len ? clean.slice(0, len) + '…' : clean
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessageCard({ triage, message }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const style = CATEGORY[triage.category] ?? CATEGORY.ignore

  const handleCopy = async () => {
    await navigator.clipboard.writeText(triage.drafted_response ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`bg-white border ${style.border} ${style.ring} rounded-xl overflow-hidden shadow-sm transition-all duration-150`}
    >
      <div className="flex">
        <div className={`w-1 flex-shrink-0 ${style.bar}`} />
        <div className="flex-1 p-4 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center flex-wrap gap-1.5">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${style.badge}`}>
                {triage.category}
              </span>
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${URGENCY_DOT[triage.urgency] ?? 'bg-slate-300'}`}
                title={triage.urgency}
              />
              <span className="text-xs text-slate-400 capitalize">{triage.urgency}</span>
              {triage.assignee && (
                <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                  → {triage.assignee}
                </span>
              )}
            </div>
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 flex-shrink-0 transition-colors"
            >
              {expanded ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                  Less
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  Response
                </>
              )}
            </button>
          </div>

          {/* Sender + time */}
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-base leading-none">{CHANNEL_ICON[message?.channel] ?? '📩'}</span>
            <span className="text-sm font-semibold text-slate-800 truncate">
              {displayName(message?.from ?? '')}
            </span>
            {message?.timestamp && (
              <span className="text-xs text-slate-400 flex-shrink-0">{formatTime(message.timestamp)}</span>
            )}
          </div>

          {/* Subject / channel */}
          {messageTitle(message) && (
            <p className="text-sm font-medium text-slate-700 mb-1 truncate">{messageTitle(message)}</p>
          )}

          {/* Body preview */}
          <p className="text-xs text-slate-500 leading-relaxed">{bodyPreview(message?.body)}</p>

          {/* Classification reason */}
          <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span className="font-semibold text-slate-700">Why: </span>{triage.reason}
          </p>

          {/* Expanded drafted response */}
          {expanded && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Drafted Response
                </span>
                <button
                  onClick={handleCopy}
                  className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  {copied ? (
                    <><svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-green-600">Copied!</span></>
                  ) : (
                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>Copy</>
                  )}
                </button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed p-3 whitespace-pre-wrap">
                {triage.drafted_response}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
