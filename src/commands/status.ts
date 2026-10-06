import { Command } from "commander"
import pc from "picocolors"
import { requestKkhay } from "../api"

export function registerStatusCommand(program: Command) {
  program
    .command("status")
    .alias("health")
    .description("Check connection and gateway health with K Khay")
    .action(async () => {
      try {
        console.log(pc.dim("Checking K Khay Gateway status..."))
        const start = Date.now()
        const res = await requestKkhay<any>("/health")
        const duration = Date.now() - start

        console.log(pc.green(pc.bold("\n✔ K Khay Gateway is ONLINE")))
        console.log(`  Latency: ${pc.cyan(duration + "ms")}`)
        console.log(`  Payload: ${JSON.stringify(res)}\n`)
      } catch (err: any) {
        console.error(pc.red(`\n✖ Connection check failed: ${err.message}\n`))
        process.exit(1)
      }
    })
}

