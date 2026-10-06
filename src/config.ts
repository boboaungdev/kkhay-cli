import fs from "node:fs"
import path from "node:path"
import os from "node:os"

export interface KkhayConfig {
  apiKey?: string
  baseUrl?: string
  ipnSecret?: string
}

const CONFIG_DIR = path.join(os.homedir(), ".kkhay")
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json")

export function loadConfig(): KkhayConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8")
      return JSON.parse(content)
    }
  } catch {}
  return {
    apiKey: process.env.KKHAY_API_KEY,
    baseUrl: process.env.KKHAY_BASE_URL || "https://api.kkhay.com",
    ipnSecret: process.env.KKHAY_IPN_SECRET,
  }
}

export function saveConfig(updates: Partial<KkhayConfig>): KkhayConfig {
  const current = loadConfig()
  const updated = { ...current, ...updates }

  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true })
  }

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8")
  return updated
}

