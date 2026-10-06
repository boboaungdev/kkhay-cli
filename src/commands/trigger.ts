import crypto from "node:crypto"
import { Command } from "commander"
import pc from "picocolors"
import { loadConfig } from "../config"

export function registerTriggerCommand(program: Command) {
  program
    .command("trigger <event>")
    .description("Trigger a simulated signed webhook event to a local or remote endpoint")
    .requiredOption("-f, --forward-to <url>", "Webhook recipient URL (e.g. http://localhost:3000/api/webhooks)")
    .option("--invoice-id <id>", "Invoice ID to simulate", "inv_simulated_test")
    .option("--order-id <id>", "Order ID", "ORD-TEST-99")
    .option("--amount <number>", "Payment amount", "50.00")
    .option("--token <token>", "Crypto token", "USDT")
    .option("--secret <secret>", "IPN Secret Key (defaults to saved config or env)")
    .action(async (event, options) => {
      const config = loadConfig()
      const secret = options.secret || config.ipnSecret || process.env.KKHAY_IPN_SECRET || "whsec_default_test_secret"

      const payload = {
        event: event,
        invoice_id: options.invoiceId,
        order_id: options.orderId,
        price_amount: parseFloat(options.amount),
        price_currency: "USD",
        pay_amount: options.amount,
        pay_token: options.token,
        pay_network: "bsc",
        deposit_address: "0x71C...test",
        tx_hash: "0x" + crypto.randomBytes(32).toString("hex"),
        status: event.includes("failed") ? "failed" : "paid",
        timestamp: new Date().toISOString(),
      }

      const rawBody = JSON.stringify(payload)
      const signature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")

      console.log(pc.bold(`\nTriggering mock event '${pc.cyan(event)}' -> ${pc.blue(options.forwardTo)}`))
      console.log(`Generated HMAC Signature: ${pc.dim(signature)}`)

      try {
        const res = await fetch(options.forwardTo, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-kkhay-signature": signature,
            "User-Agent": "kkhay-cli/1.0.0",
          },
          body: rawBody,
        })

        if (res.ok) {
          console.log(pc.green(pc.bold(`✔ Target returned HTTP ${res.status} OK`)))
        } else {
          console.log(pc.yellow(`⚠ Target returned HTTP ${res.status} (${res.statusText})`))
        }
      } catch (err: any) {
        console.error(pc.red(`✖ Failed to deliver webhook: ${err.message}`))
        process.exit(1)
      }
      console.log()
    })
}

