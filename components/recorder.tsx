"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

type Props = {
  onRecorded: (blob: Blob) => void
  disabled?: boolean
}

const MAX_SECONDS = 30

export default function Recorder({ onRecorded, disabled }: Props) {
  const [isRecording, setIsRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  // Siri-like visualizer + audio capture
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const resizeHandlerRef = useRef<(() => void) | null>(null)

  // PCM buffers (mono)
  const pcmChunksRef = useRef<Float32Array[]>([])
  const totalSamplesRef = useRef<number>(0)
  const sampleRateRef = useRef<number>(44100)

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const cleanupVisualizer = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (resizeHandlerRef.current) {
      window.removeEventListener("resize", resizeHandlerRef.current)
      resizeHandlerRef.current = null
    }
    try {
      processorRef.current?.disconnect()
    } catch {}
    try {
      sourceRef.current?.disconnect()
    } catch {}
    try {
      analyserRef.current?.disconnect?.()
    } catch {}
    processorRef.current = null
    sourceRef.current = null
    analyserRef.current = null
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close()
      } catch {}
      audioCtxRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const setupVisualizerAndCapture = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx: any = (window as any).AudioContext || (window as any).webkitAudioContext
      const audioCtx: AudioContext = new AudioCtx()
      audioCtxRef.current = audioCtx
      sampleRateRef.current = audioCtx.sampleRate

      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.3
      analyserRef.current = analyser

      const src = audioCtx.createMediaStreamSource(stream)
      sourceRef.current = src

      // Connect source -> analyser
      src.connect(analyser)

      // Create ScriptProcessor for PCM capture (mono)
      const processor = audioCtx.createScriptProcessor(4096, 1, 1)
      processor.onaudioprocess = (e: AudioProcessingEvent) => {
        const input = e.inputBuffer.getChannelData(0)
        // copy to avoid referencing the AudioBuffer memory
        const clone = new Float32Array(input.length)
        clone.set(input)
        pcmChunksRef.current.push(clone)
        totalSamplesRef.current += clone.length
      }
      processorRef.current = processor

      // Important: connect processor to destination so it runs
      processor.connect(audioCtx.destination)
      // and source to processor
      src.connect(processor)

      // Canvas setup
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const prevDataArray = new Uint8Array(analyser.frequencyBinCount)
      const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()
        canvas.width = Math.max(1, Math.floor(rect.width * dpr))
        canvas.height = Math.max(1, Math.floor(120 * dpr)) // Fixed height
        ctx.setTransform(1, 0, 0, 1, 0, 0)
      }
      resizeCanvas()
      resizeHandlerRef.current = resizeCanvas
      window.addEventListener("resize", resizeCanvas)

      const draw = () => {
        if (!analyserRef.current || !canvasRef.current || !ctx) return
        analyserRef.current.getByteFrequencyData(dataArray)

        const { width, height } = canvas
        const dpr = window.devicePixelRatio || 1
        ctx.clearRect(0, 0, width, height)

        const grad = ctx.createLinearGradient(0, 0, width, 0)
        grad.addColorStop(0, "#0A84FF")
        grad.addColorStop(0.3, "#5E5CE6")
        grad.addColorStop(0.6, "#BF5AF2")
        grad.addColorStop(1, "#FF2D55")

        const barCount = 64
        const centerY = height / 2
        const step = Math.max(1, Math.floor(dataArray.length / barCount))
        const barWidth = Math.max(2 * dpr, Math.floor((width / barCount) * 0.7))
        const gap = Math.max(1 * dpr, Math.floor((width / barCount) * 0.3))
        const total = barWidth + gap

        ctx.save()
        ctx.fillStyle = grad
        ctx.shadowColor = "rgba(10,132,255,0.4)"
        ctx.shadowBlur = 16 * dpr

        for (let i = 0; i < barCount; i++) {
          let sum = 0
          let count = 0
          for (let j = i * step; j < Math.min((i + 1) * step, dataArray.length); j++) {
            sum += dataArray[j]
            count++
          }
          const currentV = sum / Math.max(1, count)
          const prevV = prevDataArray[i] || 0
          const smoothV = prevV * 0.7 + currentV * 0.3
          prevDataArray[i] = smoothV
          const amp = Math.pow(smoothV / 255, 0.7)
          const barH = Math.max(6 * dpr, amp * (height * 0.5))
          const x = i * total + (width - barCount * total + gap) / 2
          const yTop = centerY - barH
          const yBottom = centerY + barH
          const r = Math.min(barWidth / 2, 8 * dpr)
          const pulseScale = 1 + amp * 0.1
          const adjustedBarWidth = barWidth * pulseScale
          const adjustedX = x - (adjustedBarWidth - barWidth) / 2

          // top bar
          ctx.beginPath()
          ctx.moveTo(adjustedX, yTop + r)
          ctx.arcTo(adjustedX, yTop, adjustedX + r, yTop, r)
          ctx.lineTo(adjustedX + adjustedBarWidth - r, yTop)
          ctx.arcTo(adjustedX + adjustedBarWidth, yTop, adjustedX + adjustedBarWidth, yTop + r, r)
          ctx.lineTo(adjustedX + adjustedBarWidth, centerY - r)
          ctx.arcTo(adjustedX + adjustedBarWidth, centerY, adjustedX + adjustedBarWidth - r, centerY, r)
          ctx.lineTo(adjustedX + r, centerY)
          ctx.arcTo(adjustedX, centerY, adjustedX, centerY - r, r)
          ctx.closePath()
          ctx.fill()

          // bottom bar
          ctx.beginPath()
          ctx.moveTo(adjustedX, centerY + r)
          ctx.arcTo(adjustedX, centerY, adjustedX + r, centerY, r)
          ctx.lineTo(adjustedX + adjustedBarWidth - r, centerY)
          ctx.arcTo(adjustedX + adjustedBarWidth, centerY, adjustedX + adjustedBarWidth, centerY + r, r)
          ctx.lineTo(adjustedX + adjustedBarWidth, yBottom - r)
          ctx.arcTo(adjustedX + adjustedBarWidth, yBottom, adjustedX + adjustedBarWidth - r, yBottom, r)
          ctx.lineTo(adjustedX + r, yBottom)
          ctx.arcTo(adjustedX, yBottom, adjustedX, yBottom - r, r)
          ctx.closePath()
          ctx.fill()
        }
        ctx.restore()

        rafRef.current = requestAnimationFrame(draw)
      }
      rafRef.current = requestAnimationFrame(draw)
    } catch (e) {
      console.warn("[v0] Visualizer/capture setup failed:", e)
    }
  }, [])

  function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]))
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    }
  }

  function encodeWAV(samples: Float32Array, sampleRate: number) {
    const buffer = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(buffer)

    // RIFF header
    writeString(view, 0, "RIFF")
    view.setUint32(4, 36 + samples.length * 2, true)
    writeString(view, 8, "WAVE")

    // fmt chunk
    writeString(view, 12, "fmt ")
    view.setUint32(16, 16, true) // PCM
    view.setUint16(20, 1, true) // linear PCM
    view.setUint16(22, 1, true) // mono
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true) // byte rate
    view.setUint16(32, 2, true) // block align
    view.setUint16(34, 16, true) // bits per sample

    // data chunk
    writeString(view, 36, "data")
    view.setUint32(40, samples.length * 2, true)
    floatTo16BitPCM(view, 44, samples)

    return new Blob([view], { type: "audio/wav" })
  }

  function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  const startRecording = useCallback(async () => {
    if (disabled) return
    setError(null)
    setElapsed(0)
    pcmChunksRef.current = []
    totalSamplesRef.current = 0

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setupVisualizerAndCapture(stream)
      setIsRecording(true)

      timerRef.current = window.setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1
          console.log("[v0] Timer tick:", next, "/ MAX:", MAX_SECONDS)
          if (next >= MAX_SECONDS) {
            console.log("[v0] Timer reached max, stopping...")
            // Stop timer immediately
            if (timerRef.current) {
              window.clearInterval(timerRef.current)
              timerRef.current = null
            }
            setTimeout(() => {
              console.log("[v0] Auto-stopping recording after timeout")
              // Force stop without checking isRecording state
              stopTimer()
              setIsRecording(false)

              const total = totalSamplesRef.current
              const sampleRate = sampleRateRef.current || 44100
              const all = new Float32Array(total)
              let offset = 0
              for (const chunk of pcmChunksRef.current) {
                all.set(chunk, offset)
                offset += chunk.length
              }

              const wavBlob = encodeWAV(all, sampleRate)
              console.log("[v0] Auto-stop WAV blob created, size:", wavBlob.size)
              cleanupVisualizer()
              onRecorded(wavBlob)
            }, 100)
            return MAX_SECONDS
          }
          return next
        })
      }, 1000)
    } catch (e: any) {
      console.error("[v0] Recorder error:", e)
      setError(e?.message || "Microphone access denied or unsupported.")
      cleanupVisualizer()
    }
  }, [disabled, setupVisualizerAndCapture, cleanupVisualizer, onRecorded])

  const stopRecording = useCallback(() => {
    console.log("[v0] stopRecording called, isRecording:", isRecording)
    if (!isRecording) {
      console.log("[v0] stopRecording early return - not recording")
      return
    }
    console.log("[v0] stopRecording proceeding...")
    stopTimer()
    setIsRecording(false)

    // Build a single Float32Array
    const total = totalSamplesRef.current
    const sampleRate = sampleRateRef.current || 44100
    const all = new Float32Array(total)
    let offset = 0
    for (const chunk of pcmChunksRef.current) {
      all.set(chunk, offset)
      offset += chunk.length
    }

    const wavBlob = encodeWAV(all, sampleRate)
    console.log("[v0] WAV blob created, size:", wavBlob.size)
    cleanupVisualizer()
    onRecorded(wavBlob)
  }, [isRecording, cleanupVisualizer, onRecorded])

  useEffect(() => {
    return () => {
      stopTimer()
      cleanupVisualizer()
    }
  }, [cleanupVisualizer])

  return (
    <div
      className={`glass dark:glass-dark rounded-2xl p-6 shadow-xl transition-all duration-500 ease-out hover:shadow-2xl border-0 ${
        isRecording ? "ring-2 ring-purple-500/50 shadow-purple-500/25 scale-[1.02]" : ""
      }`}
    >
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transition-all duration-500 ease-out ${
            isRecording ? "animate-pulse scale-110 shadow-lg shadow-purple-500/50 rotate-3" : "hover:scale-105"
          }`}
        >
          <svg className="w-6 h-6 text-white transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent mb-1 transition-all duration-300">
            Record Audio
          </h2>
            <p className="text-sm text-muted-foreground transition-colors duration-300">
            Captures audio from your microphone, saves it as a .wav file, and sends it to the model for genre classification.
            </p>
        </div>
      </div>

      <div className="mb-6">
  <div
    className={`glass dark:glass-dark rounded-xl border transition-all duration-500 ease-out relative overflow-hidden ${
      isRecording
        ? "border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-pink-500/5 shadow-inner p-4 h-auto opacity-100"
        : "border-border/50 h-auto p-6 opacity-100 flex items-center justify-center"
    }`}
    style={{ minHeight: "120px" }} // ensures reserved space always
  >
    {!isRecording && (
      <p className="text-sm text-muted-foreground text-left animate-fade-in">
        <span className="font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-gray-900 bg-clip-text text-transparent">Start Recording</span> and grant microphone access. <br />
        <span className="font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-gray-900 bg-clip-text text-transparent">Tip:</span> Minimize background noise for best results.
      </p>
    )}

    <canvas
      ref={canvasRef}
      className={`block w-full rounded-lg transition-all duration-500 ease-out ${
        isRecording ? "h-[120px] opacity-100" : "h-0 opacity-0"
      }`}
      aria-hidden="true"
    />
  </div>
</div>


      <div className="space-y-4">
        {/* Timer and Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-full bg-muted/50 border border-border/50 transition-all duration-300 ${
                isRecording ? "bg-purple-500/10 border-purple-500/30" : ""
              }`}
            >
              <span className="text-sm font-mono font-medium">
              {String(elapsed).padStart(2, "0")}/{MAX_SECONDS}
              </span>

            </div>
            {isRecording && (
              <div className="flex items-center gap-2 text-purple-600 animate-fade-in">
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-ping" />
                <span className="text-sm font-medium">Recording</span>
              </div>
            )}
          </div>

          {isRecording && <div className="text-xs text-muted-foreground animate-fade-in">Up to 30 seconds</div>}
        </div>

        {/* Progress Bar */}
        {isRecording && (
          <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden animate-fade-in">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${(elapsed / MAX_SECONDS) * 100}%` }}
            />
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={disabled}
              size="lg"
              className="rounded-full px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-500 ease-out shadow-lg hover:shadow-xl hover:scale-105 text-base font-medium transform"
            >
              <svg className="w-5 h-5 mr-2 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="lg"
              className="rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-500 ease-out hover:scale-105 text-base font-medium transform animate-pulse"
            >
              <svg className="w-5 h-5 mr-2 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                  clipRule="evenodd"
                />
              </svg>
              Stop Recording
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 animate-fade-in">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}
    </div>
  )
}
