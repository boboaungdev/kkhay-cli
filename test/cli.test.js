import test from "node:test"
import assert from "node:assert/strict"
import { execSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const binPath = path.resolve(__dirname, "../bin/kkhay.js")

test("CLI displays help menu with non-custodial branding", () => {
  const output = execSync(`node ${binPath} --help`).toString()
  assert.match(output, /K Khay Non-Custodial Crypto Payment Gateway CLI/i)
  assert.match(output, /190\+ blockchain networks/i)
  assert.match(output, /invoice/)
  assert.match(output, /trigger/)
  assert.match(output, /status/)
  assert.match(output, /config/)
})

test("CLI reports version 1.0.4", () => {
  const output = execSync(`node ${binPath} --version`).toString().trim()
  assert.equal(output, "1.0.4")
})

test("CLI config command works", () => {
  const getOutput = execSync(`node ${binPath} config get`).toString()
  assert.match(getOutput, /K Khay CLI Configuration:/)
  assert.match(getOutput, /apiKey:/)
  assert.match(getOutput, /baseUrl:/)
})

test("CLI invoice command help displays supported options", () => {
  const output = execSync(`node ${binPath} invoice --help`).toString()
  assert.match(output, /create/)
  assert.match(output, /get/)
  assert.match(output, /list/)
})

test("CLI invoice create help mentions multi-chain networks", () => {
  const output = execSync(`node ${binPath} invoice create --help`).toString()
  assert.match(output, /--network/)
  assert.match(output, /--token/)
  assert.match(output, /--amount/)
  assert.match(output, /--currency/)
  assert.match(output, /--type/)
})

test("CLI trigger command help displays webhook simulation options", () => {
  const output = execSync(`node ${binPath} trigger --help`).toString()
  assert.match(output, /--forward-to/)
  assert.match(output, /--secret/)
})

test("CLI status command help works", () => {
  const output = execSync(`node ${binPath} status --help`).toString()
  assert.match(output, /Check connectivity and API health/)
})
