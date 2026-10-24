import { loadConfig } from "./config"

interface ErrorResponseBody {
  error?: string
  message?: string
  code?: string
  details?: unknown
}

export async function requestKkhay<T>(path: string, options: RequestInit = {}): Promise<T> {
  const config = loadConfig()
  const apiKey = config.apiKey || process.env.KKHAY_API_KEY

  if (!apiKey) {
    throw new Error(
      "Missing API key. Please run:\n  kkhay config set apiKey <your_key>\nor set the KKHAY_API_KEY environment variable.\nGet keys at: https://gateway.kkhay.com/dashboard/keys"
    )
  }

  const rawBase = config.baseUrl || process.env.KKHAY_BASE_URL || "https://api.kkhay.com"
  const baseUrl = rawBase.replace(/\/+$/, "")
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  const url = baseUrl.endsWith("/api") || baseUrl.includes("api.")
    ? `${baseUrl}${cleanPath}`
    : `${baseUrl}/api${cleanPath}`

  const headers: Record<string, string> = {
    Accept: "application/json",
    "x-api-key": apiKey.trim(),
    "User-Agent": "kkhay-cli/1.0.4",
    ...(options.headers as Record<string, string>),
  }

  if (options.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json"
  }

  const res = await fetch(url, { ...options, headers })
  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")

  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    if (isJson) {
      const errBody = (await res.json().catch(() => null)) as ErrorResponseBody | null
      if (errBody) {
        msg = errBody.message || errBody.error || msg
      }
    } else {
      const text = await res.text().catch(() => "")
      if (text) msg = text
    }
    throw new Error(`K Khay API Error [${res.status}]: ${msg}`)
  }

  return (isJson ? await res.json() : {}) as T
}
