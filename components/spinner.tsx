"use client"

export default function Spinner() {
  return (
    <div
      aria-label="Loading"
      role="status"
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
    />
  )
}
