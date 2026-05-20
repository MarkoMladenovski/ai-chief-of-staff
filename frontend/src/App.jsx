import { useState, useEffect, useCallback } from 'react'
import TriageView from './components/TriageView'
import FlagsView from './components/FlagsView'
import BriefingView from './components/BriefingView'

export default function App() {
  const [activeTab, setActiveTab] = useState('triage')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnalysis = useCallback(async (customMessages = null) => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      let res
      if (customMessages) {
        res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: customMessages }),
        })
      } else {
        res = await fetch('/api/analyze')
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnalysis() }, [fetchAnalysis])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const messages = JSON.parse(ev.target.result)
        if (!Array.isArray(messages)) throw new Error('JSON must be an array of messages')
        fetchAnalysis(messages)
      } catch (err) {
        setError(`File error: ${err.message}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const stats = data ? {
    decide: data.analysis.triage.filter(t => t.category === 'decide').length,
    delegate: data.analysis.triage.filter(t => t.category === 'delegate').length,
    ignore: data.analysis.triage.filter(t => t.category === 'ignore').length,
    flags: data.analysis.flags.length,
  } : null

  const tabs = [
    { id: 'triage', label: 'Triage', count: data?.messages.length },
    { id: 'flags', label: 'Flags', count: data?.analysis.flags.length, alert: (stats?.flags ?? 0) > 0 },
    { id: 'briefing', label: 'Daily Briefing' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-white text-sm font-bold tracking-tight">AI</span>
              </div>
              <div>
                <h1 className="text-base font-semibold text-slate-900 leading-none">Chief of Staff</h1>
                <p className="text-xs text-slate-400 mt-0.5">Wed 18 Mar 2026 · Morning Briefing</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {stats && (
                <div className="hidden sm:flex items-center divide-x divide-slate-200 text-xs">
                  <span className="flex items-center gap-1.5 pr-3 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <strong className="text-slate-900">{stats.decide}</strong> decide
                  </span>
                  <span className="flex items-center gap-1.5 px-3 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <strong className="text-slate-900">{stats.delegate}</strong> delegate
                  </span>
                  <span className="flex items-center gap-1.5 pl-3 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <strong className="text-slate-900">{stats.ignore}</strong> ignore
                  </span>
                </div>
              )}
              <label className="cursor-pointer inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors select-none">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Load Data
                <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          <nav className="flex gap-1 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
                {tab.count != null && (
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    tab.alert && activeTab !== tab.id
                      ? 'bg-red-100 text-red-600'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6">
        {loading && <LoadingState />}
        {error && !loading && <ErrorState message={error} onRetry={() => fetchAnalysis()} />}

        {data && !loading && (
          <>
            <div className={activeTab === 'triage' ? 'block' : 'hidden'}>
              <TriageView triage={data.analysis.triage} messages={data.messages} />
            </div>
            <div className={activeTab === 'flags' ? 'block' : 'hidden'}>
              <FlagsView flags={data.analysis.flags} messages={data.messages} />
            </div>
            <div className={activeTab === 'briefing' ? 'block' : 'hidden'}>
              <BriefingView briefing={data.analysis.briefing} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function LoadingState() {
  const [step, setStep] = useState(0)
  const steps = [
    'Reading your messages…',
    'Classifying by priority…',
    'Drafting responses…',
    'Preparing your briefing…',
  ]

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-28 gap-6">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-slate-700 font-medium text-base">{steps[step]}</p>
        <p className="text-slate-400 text-sm mt-1">Claude is analysing your inbox</p>
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-center max-w-md mx-auto mt-8">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-red-800 font-semibold mb-1">Analysis failed</p>
      <p className="text-red-600 text-sm mb-5 break-words">{message}</p>
      <button
        onClick={onRetry}
        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}
