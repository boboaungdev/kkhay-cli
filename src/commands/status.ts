import { Command } from "commander"
import pc from "picocolors"
import { loadConfig } from "../config"

export function registerStatusCommand(program: Command) {
  program
    .command("status")
    .alias("health")
    .description("Check connectivity and API health with K Khay Gateway")
    .action(async () => {
      const config = loadConfig()
      const rawBase = config.baseUrl || process.env.KKHAY_BASE_URL || "https://api.kkhay.com"
      const baseUrl = rawBase.replace(/\/+$/, "")
      const endpoint = baseUrl.endsWith("/api") || baseUrl.includes("api.")
        ? `${baseUrl}/v1/gateway/invoices`
        : `${baseUrl}/api/v1/gateway/invoices`

      console.log(pc.dim(`Pinging K Khay Gateway at ${pc.bold(baseUrl)}...`))

      try {
        const start = Date.now()
        const headers: Record<string, string> = {
          Accept: "application/json",
          "User-Agent": "kkhay-cli/1.0.4",
        }

        const apiKey = config.apiKey || process.env.KKHAY_API_KEY
        if (apiKey) {
          headers["x-api-key"] = apiKey.trim()
        }

        // Send a lightweight check request
        const res = await fetch(`${endpoint}?limit=1`, {
          method: "GET",
          headers,
        })
        const duration = Date.now() - start

        if (res.status === 200) {
          console.log(pc.green(pc.bold("\n✔ K Khay Gateway is ONLINE & REACHABLE")))
          console.log(`  Latency: ${pc.cyan(duration + "ms")}`)
          console.log(`  Authentication: ${pc.green("Verified (API Key is valid and active)")}\n`)
        } else if (res.status === 401) {
          console.log(pc.green(pc.bold("\n✔ K Khay Gateway is ONLINE & REACHABLE")))
          console.log(`  Latency: ${pc.cyan(duration + "ms")}`)
          console.log(
            `  Authentication: ${
              apiKey
                ? pc.yellow("Invalid API Key (HTTP 401)")
                : pc.dim("No API Key configured (run: kkhay config set apiKey <key>)")
            }\n`
          )
        } else {
          console.log(pc.yellow(pc.bold(`\n⚠ K Khay Gateway responded with HTTP ${res.status}`)))
          console.log(`  Latency: ${pc.cyan(duration + "ms")}\n`)
        }
      } catch (err) {
        console.error(pc.red(`\n✖ Connection check failed: ${err instanceof Error ? err.message : String(err)}\n`))
        process.exit(1)
      }
    })
}
