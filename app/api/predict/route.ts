export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")
    if (!(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: "Missing file" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      })
    }

    const base = process.env.API_BASE_URL || "https://music-genre-detection-api-yv06.onrender.com"

    const outForm = new FormData()
    const name = (file as any)?.name || "audio"
    const type = file.type || "application/octet-stream"
    const proxiedFile = new File([file], name, { type })
    outForm.append("file", proxiedFile)

    const url = `${base.replace(/\/+$/, "")}/predict`
    const res = await fetch(url, {
      method: "POST",
      body: outForm,
      headers: { Accept: "application/json" },
    })

    const contentType = res.headers.get("content-type") || ""
    let payload: any = null

    if (contentType.includes("application/json")) {
      try {
        payload = await res.json()
      } catch {
        payload = null
      }
    }
    if (payload === null) {
      const text = await res.text()
      try {
        payload = JSON.parse(text)
      } catch {
        payload = res.ok ? { prediction: text } : { error: text || "Upstream error" }
      }
    }

    if (typeof payload === "string") {
      payload = { prediction: payload }
    }

    if (!res.ok && !payload?.error) {
      payload = { error: "Prediction failed", detail: payload }
    }

    return new Response(JSON.stringify(payload), {
      status: res.status,
      headers: { "content-type": "application/json" },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  }
}
