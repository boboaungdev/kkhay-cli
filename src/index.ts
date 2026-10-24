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
    pc.bold("K Khay Non-Custodial Crypto Payment Gateway CLI") +
      "\nAccept 500+ cryptocurrencies across 190+ blockchain networks with zero custody.\nManage invoices, test IPN webhooks, and inspect configurations directly from your terminal."
  )
  .version("1.0.4")

registerConfigCommand(program)
registerInvoiceCommand(program)
registerTriggerCommand(program)
registerStatusCommand(program)

program.parse(process.argv)
