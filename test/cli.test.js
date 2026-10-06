import test from "node:test"
import assert from "node:assert/strict"
import { execSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const binPath = path.resolve(__dirname, "../bin/kkhay.js")

test("CLI displays help menu", () => {
  const output = execSync(`node ${binPath} --help`).toString()
  assert.match(output, /K Khay Sovereign Crypto Payment Gateway CLI/i)
  assert.match(output, /Commands:/)
  assert.match(output, /invoice/)
  assert.match(output, /trigger/)
})

test("CLI config command works", () => {
  const getOutput = execSync(`node ${binPath} config get`).toString()
  assert.match(getOutput, /K Khay CLI Configuration:/)
})

