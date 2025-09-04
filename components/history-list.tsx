"use client"

import type { PredictionResult } from "./result-card"

export default function HistoryList({ items }: { items: PredictionResult[] }) {
  if (!items?.length) return null

  return (
    <div className="glass dark:glass-dark rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl border-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent">
            Recent History
          </h2>
          <p className="text-sm text-muted-foreground">Last 3 predictions</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((it, index) => (
          <div
            key={it.id}
            className="glass dark:glass-dark rounded-xl p-4 border border-muted-foreground/10 hover:border-orange-500/20 transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-orange-600">#{index + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{it.fileName}</p>
                  <p className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {it.genre}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground">{new Date(it.at).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground">{new Date(it.at).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
