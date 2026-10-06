import { Command } from "commander"
import pc from "picocolors"
import { registerConfigCommand } from "./commands/config"
import { registerInvoiceCommand } from "./commands/invoice"
import { registerTriggerCommand } from "./commands/trigger"
import { registerStatusCommand } from "./commands/status"

const program = new Command()

program
  .name("kkhay")
  .description(
    pc.bold("K Khay Sovereign Crypto Payment Gateway CLI") +
      "\nInteract with invoices, test IPN webhooks, and manage merchant configurations from the terminal."
  )
  .version("1.0.0")

registerConfigCommand(program)
registerInvoiceCommand(program)
registerTriggerCommand(program)
registerStatusCommand(program)

program.parse(process.argv)

