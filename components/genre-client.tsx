"use client"

import { useCallback, useEffect, useState } from "react"
import Recorder from "./recorder"
import Uploader from "./uploader"
import ResultCard, { type PredictionResult } from "./result-card"
import HistoryList from "./history-list"

type NormalizedResponse = {
  genre: string
  confidence: number | null
  allProbabilities: Record<string, number> | null
}

function normalizeResponse(json: any): NormalizedResponse {
  if (typeof json === "string") {
    return { genre: json, confidence: null, allProbabilities: null }
  }

  const genre = json?.predicted_genre ?? json?.genre ?? json?.prediction ?? json?.label ?? json?.class ?? "Unknown"
  const confidence = json?.confidence ?? null
  const allProbabilities = json?.all_probabilities ?? null

  return {
    genre: String(genre),
    confidence: typeof confidence === "number" ? confidence : null,
    allProbabilities: allProbabilities && typeof allProbabilities === "object" ? allProbabilities : null,
  }
}

const HISTORY_KEY = "mgc_history_v1"
const MAX_HISTORY = 3

export default function GenreClient() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [history, setHistory] = useState<PredictionResult[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, MAX_HISTORY))
        }
      }
    } catch {
      // no-op
    }
  }, [])

  const pushHistory = useCallback((entry: PredictionResult) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, MAX_HISTORY)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const handlePredict = useCallback(
    async (file: File) => {
      setError(null)
      setIsLoading(true)
      setResult(null)

      try {
        const form = new FormData()
        form.append("file", file)
        console.log("[v0] Sending to /api/predict with file:", file.name, file.type, file.size)

        const res = await fetch("/api/predict", { method: "POST", body: form })

        const contentType = res.headers.get("content-type") || ""
        let body: any
        if (contentType.includes("application/json")) {
          try {
            body = await res.json()
          } catch {
            const text = await res.text()
            try {
              body = JSON.parse(text)
            } catch {
              body = { error: text || "Malformed response" }
            }
          }
        } else {
          const text = await res.text()
          try {
            body = JSON.parse(text)
          } catch {
            body = res.ok ? { prediction: text } : { error: text || "Malformed response" }
          }
        }

        if (!res.ok || body?.error) {
          const msg =
            (typeof body?.error === "string" && body.error) ||
            (Array.isArray(body?.detail) && body.detail[0]?.msg) ||
            `Request failed with ${res.status}`
          throw new Error(msg)
        }

        const normalized = normalizeResponse(body)
        const entry: PredictionResult = {
          id: `${Date.now()}`,
          fileName: file.name,
          genre: normalized.genre,
          confidence: normalized.confidence ?? undefined,  // ✅ safe
          allProbabilities: normalized.allProbabilities ?? undefined,
          at: new Date().toISOString(),
}


        setResult(entry)
        pushHistory(entry)
      } catch (e: any) {
        console.error("[v0] Prediction error:", e)
        setError(e?.message || "Something went wrong")
      } finally {
        setIsLoading(false)
      }
    },
    [pushHistory],
  )

  const onRecorded = useCallback(
    (blob: Blob) => {
      const tooSmall = blob.size < 8 * 1024 // 8KB threshold for silence/very short
      if (tooSmall) {
        console.log("[v0] Warning: recording is very small, predictions may default.")
        setError("Recording is very quiet/short. Try speaking closer to the mic.")
      }
      const file = new File([blob], "recording.wav", { type: "audio/wav" })
      handlePredict(file)
    },
    [handlePredict],
  )

  const onFileSelected = useCallback(
    (file: File) => {
      handlePredict(file)
    },
    [handlePredict],
  )

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Recorder onRecorded={onRecorded} disabled={isLoading} />
        <Uploader onFileSelected={onFileSelected} disabled={isLoading} />
      </div>

      {error && (
        <div className="glass dark:glass-dark rounded-xl sm:rounded-2xl p-3 sm:p-4 border-l-4 border-destructive bg-destructive/5">
          <p className="text-xs sm:text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      <ResultCard result={result} isLoading={isLoading} />

      <HistoryList items={history} />
    </div>
  )
}
