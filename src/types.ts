/**
 * K Khay CLI Type Definitions
 * Exact 1:1 match with K Khay Gateway Schema & DTOs
 *
 * @license MIT
 */

export type GatewayInvoiceStatus = "WAITING" | "PAID" | "EXPIRED" | "CANCELED"
export type GatewayInvoiceType = "PAYMENT" | "DONATION" | "SUBSCRIPTION"
export type GatewaySettlementMode = "NON_CUSTODIAL" | "CUSTODIAL"
export type GatewayPaymentMethod = "DEPOSIT" | "WALLET"
export type GatewayPaymentStatus = "SETTLING" | "SETTLED" | "FAILED"

export interface KkhayConfig {
  apiKey?: string
  baseUrl?: string
  ipnSecret?: string
}

export interface CreateInvoiceRequest {
  amount?: number
  priceAmount?: number
  currency?: string
  priceCurrency?: string
  type?: GatewayInvoiceType
  payNetwork?: string
  payToken?: string
  settlementAsset?: string | null
  orderId?: string
  title?: string
  customerName?: string
  customerEmail?: string
  redirectUrl?: string
  cancelUrl?: string
  ipnCallbackUrl?: string
  metadata?: Record<string, unknown>
}

export interface GatewayInvoiceDto {
  id: string
  gatewayId: string
  type: GatewayInvoiceType
  orderId: string | null
  title: string | null
  amount: number
  currency: string
  priceAmount: number
  priceCurrency: string
  settlementAsset: string | null
  payAmount: string | null
  payToken: string | null
  payNetwork: string | null
  lockedRate: string | null
  depositAddress: string
  derivationIndex?: number
  status: GatewayInvoiceStatus
  feeAmount: string
  netAmount: string
  customerName: string | null
  customerEmail: string | null
  redirectUrl: string | null
  cancelUrl: string | null
  ipnCallbackUrl: string | null
  paymentMethod?: GatewayPaymentMethod | null
  settlementMode?: GatewaySettlementMode | null
  payoutAddress: string
  metadata: Record<string, unknown> | null
  hostedUrl: string
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface GatewayPaymentDto {
  id: string
  invoiceId: string
  txHash: string
  fromAddress?: string | null
  amountReceived: string
  confirmations: number
  forwardedTxHash?: string | null
  forwardedAt?: string | null
  status: GatewayPaymentStatus
  createdAt: string
}

export interface GetInvoiceResponse {
  ok: boolean
  invoice: GatewayInvoiceDto
  payments: GatewayPaymentDto[]
}

export interface ListInvoicesResponse {
  ok: boolean
  items: GatewayInvoiceDto[]
  totalCount: number
  totalPages: number
  currentPage: number
  limit: number
}

export interface KkhayWebhookEvent {
  event: string
  invoice_id: string
  invoice_type?: GatewayInvoiceType
  gateway_id: string
  order_id: string | null
  amount?: number
  currency?: string
  price_amount: number
  price_currency: string
  pay_amount: string | null
  pay_token: string | null
  pay_network: string | null
  deposit_address: string
  tx_hash?: string | null
  status: string
  timestamp: string
}

