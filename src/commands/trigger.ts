import { createHmac, randomBytes } from "node:crypto"
import { Command } from "commander"
import pc from "picocolors"
import { loadConfig } from "../config"
import type { KkhayWebhookEvent } from "../types"

export function registerTriggerCommand(program: Command) {
  program
    .command("trigger [event]")
    .description("Trigger a simulated HMAC-SHA256 signed webhook event to a local or remote endpoint")
    .requiredOption("-f, --forward-to <url>", "Webhook recipient URL (e.g. http://localhost:3000/api/webhooks)")
    .option("--invoice-id <id>", "Invoice ID to simulate", "01940000-0000-7000-8000-000000000001")
    .option("--gateway-id <id>", "Gateway ID to simulate", "gw_019400000000")
    .option("--order-id <id>", "Order reference ID", "ORD-TEST-99")
    .option("--amount <number>", "Payment amount", "50.00")
    .option("--token <token>", "Crypto token symbol", "USDT")
    .option("--network <network>", "Blockchain network ID", "bsc")
    .option("--secret <secret>", "IPN Webhook Secret Key (defaults to saved config or env)")
    .action(async (eventArg: string | undefined, options) => {
      const config = loadConfig()
      const secret =
        options.secret || config.ipnSecret || process.env.KKHAY_IPN_SECRET || "whsec_default_mock_webhook_secret"
      const eventName = eventArg || "payment.paid"

      const amountNum = parseFloat(options.amount) || 50.0

      const payload: KkhayWebhookEvent = {
        event: eventName,
        invoice_id: options.invoiceId,
        gateway_id: options.gatewayId,
        order_id: options.orderId,
        amount: amountNum,
        price_amount: amountNum,
        currency: "USD",
        price_currency: "USD",
        pay_amount: options.amount,
        pay_token: options.token.toUpperCase(),
        pay_network: options.network.toLowerCase(),
        deposit_address: "0x71C...testDepositAddress",
        tx_hash: "0x" + randomBytes(32).toString("hex"),
        status: eventName.includes("fail") ? "FAILED" : "PAID",
        timestamp: new Date().toISOString(),
      }

      const rawBody = JSON.stringify(payload)
      const signature = createHmac("sha256", secret).update(rawBody).digest("hex")

      console.log(pc.bold(`\nTriggering mock event '${pc.cyan(eventName)}' -> ${pc.blue(options.forwardTo)}`))
      console.log(`HMAC-SHA256 Signature (x-kkhay-signature): ${pc.dim(signature)}`)

      try {
        const res = await fetch(options.forwardTo, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-kkhay-signature": signature,
            "User-Agent": "kkhay-cli/1.0.4",
          },
          body: rawBody,
        })

        if (res.ok) {
          console.log(pc.green(pc.bold(`✔ Target endpoint returned HTTP ${res.status} OK`)))
        } else {
          console.log(pc.yellow(`⚠ Target endpoint returned HTTP ${res.status} (${res.statusText})`))
        }
      } catch (err) {
        console.error(pc.red(`✖ Failed to deliver webhook: ${err instanceof Error ? err.message : String(err)}`))
        process.exit(1)
      }
      console.log()
    })
}
