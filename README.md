# K Khay CLI ⚡

Official Terminal CLI tool for the **[K Khay Sovereign Crypto Payment Gateway](https://kkhay.com)**.

Create invoices, display terminal ASCII QR codes, check blockchain confirmations, and test webhook endpoints locally.

---

## 📦 Installation

Run directly without installing using `npx`:
```bash
npx kkhay-cli --help
```

Or install globally:
```bash
npm install -g kkhay-cli
```

---

## ⚡ Setup API Key

```bash
kkhay config set apiKey kkhay_live_your_key_here
```

Or set the environment variable:
```bash
export KKHAY_API_KEY="kkhay_live_your_key_here"
```

---

## 🚀 Commands

### 1. Create an Invoice (with terminal QR code)
```bash
kkhay invoice create \
  --amount 49.99 \
  --network bsc \
  --token USDT \
  --title "Pro Annual" \
  --order-id "ORD-991"
```

### 2. Inspect an Invoice
```bash
kkhay invoice get inv_9f81a7b2
```

### 3. List Recent Invoices
```bash
kkhay invoice list --limit 10
```

### 4. Trigger Simulated Signed Webhooks
Test your local backend webhook handlers without sending real cryptocurrency:
```bash
kkhay trigger payment.finished \
  --forward-to http://localhost:3000/api/webhooks \
  --amount 50 \
  --token USDT
```

### 5. Check Gateway Status
```bash
kkhay status
```

---

## 📄 License

MIT © [K Khay](https://kkhay.com)

