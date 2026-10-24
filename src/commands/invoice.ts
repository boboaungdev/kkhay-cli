import { Command } from "commander"
import pc from "picocolors"
import qrcode from "qrcode-terminal"
import { requestKkhay } from "../api"
import type {
  GatewayInvoiceDto,
  GetInvoiceResponse,
  ListInvoicesResponse,
  CreateInvoiceRequest,
  GatewayInvoiceStatus,
  GatewayInvoiceType,
} from "../types"

function formatStatus(status: GatewayInvoiceStatus): string {
  switch (status) {
    case "PAID":
      return pc.green(pc.bold(status))
    case "WAITING":
      return pc.yellow(pc.bold(status))
    case "EXPIRED":
      return pc.red(status)
    case "CANCELED":
      return pc.dim(status)
    default:
      return status
  }
}

export function registerInvoiceCommand(program: Command) {
  const invoiceCmd = program.command("invoice").description("Create and manage crypto payment invoices")

  invoiceCmd
    .command("create")
    .description("Generate a new payment invoice (190+ networks, 500+ tokens)")
    .requiredOption("-a, --amount <number>", "Price amount to charge (e.g. 50.00)")
    .requiredOption(
      "-n, --network <string>",
      "Blockchain network (e.g. bsc, polygon, base, arbitrum, solana, bitcoin, ton, tron)"
    )
    .requiredOption("-t, --token <string>", "Payment token symbol (e.g. USDT, USDC, BTC, ETH, SOL, TON, BNB)")
    .option("-c, --currency <string>", "Base fiat currency code (default: USD)", "USD")
    .option("--type <type>", "Invoice type: PAYMENT, DONATION, or SUBSCRIPTION", "PAYMENT")
    .option("--order-id <string>", "Internal gateway order ID reference")
    .option("--title <string>", "Product or service title")
    .option("--customer-name <name>", "Customer display name")
    .option("--customer-email <email>", "Customer email address for receipts")
    .option("--redirect-url <url>", "Success redirect URL")
    .option("--cancel-url <url>", "Cancel redirect URL")
    .option("--ipn-url <url>", "Custom webhook IPN notification URL")
    .option("--no-qr", "Skip rendering terminal ASCII QR code")
    .action(async (options) => {
      try {
        const amountNum = parseFloat(options.amount)
        if (isNaN(amountNum) || amountNum <= 0) {
          console.error(pc.red("\n✖ Error: --amount must be a valid positive number.\n"))
          process.exit(1)
        }

        const payload: CreateInvoiceRequest = {
          amount: amountNum,
          priceAmount: amountNum,
          currency: options.currency,
          priceCurrency: options.currency,
          payNetwork: options.network.toLowerCase().trim(),
          payToken: options.token.toUpperCase().trim(),
          type: options.type?.toUpperCase() as GatewayInvoiceType,
          orderId: options.orderId,
          title: options.title,
          customerName: options.customerName,
          customerEmail: options.customerEmail,
          redirectUrl: options.redirectUrl,
          cancelUrl: options.cancelUrl,
          ipnCallbackUrl: options.ipnUrl,
        }

        console.log(pc.dim("Creating invoice on K Khay Non-Custodial Gateway..."))
        const res = await requestKkhay<{ ok: boolean; invoice: GatewayInvoiceDto }>("/v1/gateway/invoices", {
          method: "POST",
          body: JSON.stringify(payload),
        })

        const inv = res.invoice
        console.log(pc.green(pc.bold("\n✔ Invoice Created Successfully!")))
        console.log("--------------------------------------------------")
        console.log(`  ${pc.bold("Invoice ID:")}      ${pc.cyan(inv.id)}`)
        console.log(`  ${pc.bold("Gateway ID:")}      ${inv.gatewayId}`)
        console.log(`  ${pc.bold("Status:")}          ${formatStatus(inv.status)}`)
        console.log(`  ${pc.bold("Charge:")}          $${inv.priceAmount} ${inv.priceCurrency}`)
        console.log(
          `  ${pc.bold("Pay Amount:")}      ${pc.bold(inv.payAmount || "TBD")} ${inv.payToken || ""} (${(
            inv.payNetwork || ""
          ).toUpperCase()})`
        )
        console.log(`  ${pc.bold("Deposit Address:")} ${pc.magenta(inv.depositAddress)}`)
        console.log(`  ${pc.bold("Checkout URL:")}    ${pc.blue(pc.underline(inv.hostedUrl))}`)
        console.log(`  ${pc.bold("Expires At:")}       ${inv.expiresAt}`)
        console.log("--------------------------------------------------")

        if (options.qr && inv.depositAddress) {
          console.log(pc.bold("\nDeposit Address QR Code:"))
          qrcode.generate(inv.depositAddress, { small: true })
        }
      } catch (err) {
        console.error(pc.red(`\n✖ Error: ${err instanceof Error ? err.message : String(err)}\n`))
        process.exit(1)
      }
    })

  invoiceCmd
    .command("get <id>")
    .description("Retrieve invoice details by UUID")
    .action(async (id: string) => {
      try {
        console.log(pc.dim(`Fetching invoice ${id}...`))
        const res = await requestKkhay<GetInvoiceResponse>(`/v1/gateway/invoices/${encodeURIComponent(id.trim())}`)

        const inv = res.invoice
        console.log(pc.bold(`\nInvoice Details [${inv.id}]:`))
        console.log(`  Gateway ID:      ${inv.gatewayId}`)
        console.log(`  Status:          ${formatStatus(inv.status)}`)
        console.log(`  Charge:          $${inv.priceAmount} ${inv.priceCurrency}`)
        console.log(
          `  Expected Crypto: ${inv.payAmount || "TBD"} ${inv.payToken || ""} on ${(
            inv.payNetwork || ""
          ).toUpperCase()}`
        )
        console.log(`  Deposit Address: ${pc.cyan(inv.depositAddress)}`)
        console.log(`  Destination:     ${inv.payoutAddress}`)
        console.log(`  Checkout URL:    ${pc.blue(inv.hostedUrl)}`)
        console.log(`  Expires At:      ${inv.expiresAt}`)
        console.log(`  Created At:      ${inv.createdAt}`)

        if (res.payments && res.payments.length > 0) {
          console.log(pc.bold("\nBlockchain Payments Received:"))
          for (const p of res.payments) {
            console.log(
              `  • ${p.amountReceived} ${inv.payToken || ""} | Confirms: ${p.confirmations} | Status: ${
                p.status
              } | Tx: ${pc.dim(p.txHash)}`
            )
          }
        } else {
          console.log(pc.dim("\n  (No on-chain deposits detected yet)"))
        }
        console.log()
      } catch (err) {
        console.error(pc.red(`\n✖ Error: ${err instanceof Error ? err.message : String(err)}\n`))
        process.exit(1)
      }
    })

  invoiceCmd
    .command("list")
    .description("List gateway invoices")
    .option("-l, --limit <number>", "Number of invoices to list", "10")
    .option("-p, --page <number>", "Page number", "1")
    .option("-s, --status <string>", "Filter by status (WAITING, PAID, EXPIRED, CANCELED)")
    .option("-t, --type <string>", "Filter by type (PAYMENT, DONATION, SUBSCRIPTION)")
    .option("-q, --search <string>", "Search by invoice ID, order ID, or customer")
    .action(async (options) => {
      try {
        const query = new URLSearchParams()
        if (options.limit) query.set("limit", options.limit)
        if (options.page) query.set("page", options.page)
        if (options.status) query.set("status", options.status.toUpperCase())
        if (options.type) query.set("type", options.type.toUpperCase())
        if (options.search) query.set("search", options.search)

        const res = await requestKkhay<ListInvoicesResponse>(`/v1/gateway/invoices?${query.toString()}`)

        console.log(
          pc.bold(`\nGateway Invoices (Page ${res.currentPage}/${res.totalPages || 1} • Total: ${res.totalCount})\n`)
        )
        console.log(
          `${pc.dim("ID".padEnd(38))} ${pc.dim("STATUS".padEnd(12))} ${pc.dim("CHARGE".padEnd(14))} ${pc.dim(
            "CRYPTO".padEnd(12)
          )} ${pc.dim("NETWORK")}`
        )
        console.log("-".repeat(88))

        if (!res.items || res.items.length === 0) {
          console.log(pc.dim("  (No invoices found matching query)"))
        } else {
          for (const item of res.items) {
            const statusCol = formatStatus(item.status).padEnd(20)
            const chargeCol = `$${item.priceAmount} ${item.priceCurrency}`.padEnd(14)
            const cryptoCol = `${item.payToken || "N/A"}`.padEnd(12)
            const networkCol = (item.payNetwork || "N/A").toUpperCase()
            console.log(`${item.id.padEnd(38)} ${statusCol} ${chargeCol} ${cryptoCol} ${networkCol}`)
          }
        }
        console.log()
      } catch (err) {
        console.error(pc.red(`\n✖ Error: ${err instanceof Error ? err.message : String(err)}\n`))
        process.exit(1)
      }
    })
}
