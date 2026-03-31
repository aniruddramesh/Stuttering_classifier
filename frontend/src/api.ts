export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface WindowResult {
  start_sec: number
  end_sec: number
  label: string
  confidence: number
  probs: Record<string, number>
}

export interface InferenceResult {
  predicted_label: string
  confidence: number
  class_probs: Record<string, number>
  stutter_pct: number
  duration_sec: number
  timeline: WindowResult[]
}

export async function runInference(file: File): Promise<InferenceResult> {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${API_URL}/infer`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    try {
      const data = (await res.json()) as { detail?: string }
      if (data?.detail) msg = data.detail
    } catch {
      // ignore
    }
    throw new Error(msg)
  }

  return (await res.json()) as InferenceResult
}
