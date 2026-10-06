import { Command } from "commander"
import pc from "picocolors"
import qrcode from "qrcode-terminal"
import { requestKkhay } from "../api"

export function registerInvoiceCommand(program: Command) {
  const invoiceCmd = program.command("invoice").description("Create and manage crypto payment invoices")

  invoiceCmd
    .command("create")
    .description("Generate a new payment invoice")
    .requiredOption("-a, --amount <number>", "Price amount (e.g. 50.00)")
    .requiredOption("-n, --network <string>", "Payment blockchain network (bsc, polygon, base, arbitrum, ethereum)")
    .requiredOption("-t, --token <string>", "Payment token symbol (USDT, USDC, BNB, ETH)")
    .option("-c, --currency <string>", "Currency code (default: USD)", "USD")
    .option("--order-id <string>", "Internal order ID")
    .option("--title <string>", "Product or service title")
    .option("--customer-email <email>", "Customer email address")
    .option("--no-qr", "Skip rendering terminal QR code")
    .action(async (options) => {
      try {
        const payload = {
          priceAmount: parseFloat(options.amount),
          priceCurrency: options.currency,
          payNetwork: options.network,
          payToken: options.token,
          orderId: options.orderId,
          title: options.title,
          customerEmail: options.customerEmail,
        }

        console.log(pc.dim("Creating invoice on K Khay Gateway..."))
        const res = await requestKkhay<{ ok: boolean; invoice: any }>("/v1/merchant/invoices", {
          method: "POST",
          body: JSON.stringify(payload),
        })

        const inv = res.invoice
        console.log(pc.green(pc.bold("\n✔ Invoice Created Successfully!")))
        console.log("--------------------------------------------------")
        console.log(`  ${pc.bold("Invoice ID:")}      ${pc.cyan(inv.id)}`)
        console.log(`  ${pc.bold("Status:")}          ${pc.yellow(inv.status)}`)
        console.log(`  ${pc.bold("Charge:")}          $${inv.priceAmount} ${inv.priceCurrency}`)
        console.log(`  ${pc.bold("Pay Amount:")}      ${pc.bold(inv.payAmount)} ${inv.payToken} (${inv.payNetwork.toUpperCase()})`)
        console.log(`  ${pc.bold("Deposit Address:")} ${pc.magenta(inv.depositAddress)}`)
        console.log(`  ${pc.bold("Checkout URL:")}    ${pc.blue(pc.underline(inv.hostedUrl))}`)
        console.log("--------------------------------------------------")

        if (options.qr && inv.depositAddress) {
          console.log(pc.bold("\nDeposit Address QR Code:"))
          qrcode.generate(inv.depositAddress, { small: true })
        }
      } catch (err: any) {
        console.error(pc.red(`\n✖ Error: ${err.message}\n`))
        process.exit(1)
      }
    })

  invoiceCmd
    .command("get <id>")
    .description("Retrieve invoice details by UUID")
    .action(async (id) => {
      try {
        console.log(pc.dim(`Fetching invoice ${id}...`))
        const res = await requestKkhay<{ ok: boolean; invoice: any; payments: any[] }>(
          `/v1/merchant/invoices/${encodeURIComponent(id)}`
        )

        const inv = res.invoice
        console.log(pc.bold(`\nInvoice Details [${inv.id}]:`))
        console.log(`  Status:          ${inv.status === "FINISHED" ? pc.green(inv.status) : pc.yellow(inv.status)}`)
        console.log(`  Expected:        ${inv.payAmount} ${inv.payToken} on ${inv.payNetwork.toUpperCase()}`)
        console.log(`  Deposit Address: ${pc.cyan(inv.depositAddress)}`)
        console.log(`  Checkout URL:    ${pc.blue(inv.hostedUrl)}`)
        console.log(`  Expires At:      ${inv.expiresAt}`)

        if (res.payments && res.payments.length > 0) {
          console.log(pc.bold("\nBlockchain Payments Received:"))
          for (const p of res.payments) {
            console.log(`  • ${p.amountReceived} ${inv.payToken} | Confirms: ${p.confirmations} | Tx: ${pc.dim(p.txHash)}`)
          }
        } else {
          console.log(pc.dim("\n  (No on-chain deposits detected yet)"))
        }
        console.log()
      } catch (err: any) {
        console.error(pc.red(`\n✖ Error: ${err.message}\n`))
        process.exit(1)
      }
    })

  invoiceCmd
    .command("list")
    .description("List merchant invoices")
    .option("-l, --limit <number>", "Number of invoices to list", "10")
    .option("-s, --status <string>", "Filter by status (WAITING, FINISHED, etc.)")
    .action(async (options) => {
      try {
        const query = new URLSearchParams({ limit: options.limit })
        if (options.status) query.set("status", options.status)

        const res = await requestKkhay<{ ok: boolean; items: any[]; totalCount: number }>(
          `/v1/merchant/invoices?${query.toString()}`
        )

        console.log(pc.bold(`\nTotal Invoices: ${res.totalCount}\n`))
        console.log(
          `${pc.dim("ID".padEnd(38))} ${pc.dim("STATUS".padEnd(12))} ${pc.dim("AMOUNT".padEnd(14))} ${pc.dim("TOKEN".padEnd(8))} ${pc.dim("NETWORK")}`
        )
        console.log("-".repeat(80))

        for (const item of res.items) {
          const statusCol = item.status === "FINISHED" ? pc.green(item.status.padEnd(12)) : pc.yellow(item.status.padEnd(12))
          console.log(
            `${item.id.padEnd(38)} ${statusCol} $${String(item.priceAmount).padEnd(13)} ${item.payToken.padEnd(8)} ${item.payNetwork}`
          )
        }
        console.log()
      } catch (err: any) {
        console.error(pc.red(`\n✖ Error: ${err.message}\n`))
        process.exit(1)
      }
    })
}

