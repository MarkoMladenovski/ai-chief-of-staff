import ReactMarkdown from 'react-markdown'

export default function BriefingView({ briefing }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-slate-50">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Daily Briefing</h2>
          <p className="text-xs text-slate-500 mt-0.5">Wednesday, 18 March 2026 · For CEO</p>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
          2 min read
        </span>
      </div>
      <div className="px-8 py-6">
        <div className="prose prose-slate max-w-none
          prose-h2:text-base prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-2 prose-h2:text-slate-900
          prose-p:text-sm prose-p:text-slate-700 prose-p:leading-relaxed
          prose-li:text-sm prose-li:text-slate-700
          prose-strong:text-slate-900
          prose-ul:mt-1 prose-ul:space-y-0.5
          first:prose-h2:mt-0">
          <ReactMarkdown>{briefing}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
