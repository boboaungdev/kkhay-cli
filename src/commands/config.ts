import { Command } from "commander"
import pc from "picocolors"
import { loadConfig, saveConfig } from "../config"

export function registerConfigCommand(program: Command) {
  const configCmd = program.command("config").description("Manage K Khay CLI configuration and API keys")

  configCmd
    .command("set <key> <value>")
    .description("Set a configuration option (apiKey, baseUrl, ipnSecret)")
    .action((key, value) => {
      const allowed = ["apiKey", "baseUrl", "ipnSecret"]
      if (!allowed.includes(key)) {
        console.error(pc.red(`Invalid configuration key '${key}'. Allowed: ${allowed.join(", ")}`))
        process.exit(1)
      }

      saveConfig({ [key]: value })
      console.log(pc.green(`✔ Successfully updated ${pc.bold(key)}`))
    })

  configCmd
    .command("get [key]")
    .description("Display current CLI configuration")
    .action((key) => {
      const current = loadConfig()
      if (key) {
        console.log(`${key}: ${current[key as keyof typeof current] ?? pc.dim("(not set)")}`)
      } else {
        console.log(pc.bold("\nK Khay CLI Configuration:"))
        console.log(`  apiKey:    ${current.apiKey ? pc.green(current.apiKey.slice(0, 10) + "..." + current.apiKey.slice(-4)) : pc.dim("(not set)")}`)
        console.log(`  baseUrl:   ${pc.cyan(current.baseUrl || "https://api.kkhay.com")}`)
        console.log(`  ipnSecret: ${current.ipnSecret ? pc.green("********") : pc.dim("(not set)")}\n`)
      }
    })
}

