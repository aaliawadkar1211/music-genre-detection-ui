"use client"

import Spinner from "./spinner"

export type PredictionResult = {
  id: string
  fileName: string
  genre: string
  confidence?: number
  allProbabilities?: Record<string, number>
  at: string // ISO
}

export default function ResultCard({
  result,
  isLoading,
}: {
  result: PredictionResult | null
  isLoading: boolean
}) {
  return (
    <div className="glass dark:glass-dark rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl border-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-green-600 bg-clip-text text-transparent">
            AI Prediction
          </h2>
          <p className="text-sm text-muted-foreground">Genre classification results</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Spinner />
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Analyzing Audio</p>
            <p className="text-sm text-muted-foreground">Our AI is processing your music...</p>
          </div>
        </div>
      ) : result ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-muted/30">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Audio File</p>
              <p className="font-semibold text-foreground">{result.fileName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Analyzed</p>
              <p className="font-semibold text-foreground">{new Date(result.at).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            <div className="glass dark:glass-dark rounded-xl p-6 border border-green-500/20 bg-gradient-to-br from-green-500/5 to-blue-500/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Predicted Genre</p>
              </div>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {result.genre}
                </p>
                {result.confidence && (
                  <p className="text-lg font-semibold text-muted-foreground">{result.confidence.toFixed(1)}%</p>
                )}
              </div>
            </div>
          </div>

          {result.allProbabilities && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                All Genre Probabilities
              </h3>
              <div className="space-y-2">
                {Object.entries(result.allProbabilities)
                  .sort(([, a], [, b]) => b - a)
                  .map(([genre, probability]) => (
                    <div key={genre} className="flex items-center gap-3">
                      <div className="w-16 text-xs font-medium text-muted-foreground capitalize">{genre}</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${(probability * 100).toFixed(1)}%` }}
                        />
                      </div>
                      <div className="w-12 text-xs font-medium text-right">{(probability * 100).toFixed(1)}%</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-foreground mb-2">Ready to Analyze</p>
          <p className="text-sm text-muted-foreground">
            Record or upload an audio file to see the AI prediction results.
          </p>
        </div>
      )}
    </div>
  )
}
