/**
 * Hierkey Deployment Script (NEAR Protocol Testnet)
 *
 * Deploys contracts-near/target/wasm32-unknown-unknown/release/hierkey_contract.wasm
 * to a target NEAR account on testnet using near-api-js.
 *
 * Usage:
 *   node scripts/deploy-near.mjs
 *
 * Environment variables:
 *   NEAR_ACCOUNT_ID=<account_id.testnet>
 *   NEAR_PRIVATE_KEY=<ed25519:...>
 *   NEAR_NETWORK_ID=testnet (default)
 *   NEAR_NODE_URL=https://rpc.testnet.near.org (default)
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import * as nearAPI from "near-api-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
const envPath = resolve(__dirname, "../.env");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const ACCOUNT_ID =
  process.env.NEAR_ACCOUNT_ID ||
  process.env.VITE_NEAR_CONTRACT_ID ||
  process.env.VITE_CONTRACT_ADDRESS ||
  "";
const PRIVATE_KEY = process.env.NEAR_PRIVATE_KEY || "";
const NETWORK_ID = process.env.NEAR_NETWORK_ID || "testnet";
const NODE_URL =
  process.env.NEAR_NODE_URL ||
  process.env.VITE_NEAR_NODE_URL ||
  "https://rpc.testnet.near.org";

const WASM_PATH = resolve(
  __dirname,
  "../contracts-near/target/wasm32-unknown-unknown/release/hierkey_contract.wasm"
);

async function main() {
  console.log("==================================================================");
  console.log("  HIERKEY NEAR CONTRACT DEPLOYMENT");
  console.log("==================================================================");
  console.log(`Target Network:  ${NETWORK_ID} (${NODE_URL})`);
  console.log(`Contract Acct:   ${ACCOUNT_ID || "(Unset)"}`);
  console.log(`Wasm Binary:     ${WASM_PATH}`);
  console.log("------------------------------------------------------------------");

  if (!existsSync(WASM_PATH)) {
    console.error(`❌ Compiled Wasm not found at ${WASM_PATH}`);
    console.error("Run: cd contracts-near && cargo build --target wasm32-unknown-unknown --release");
    process.exit(1);
  }

  const wasmBinary = readFileSync(WASM_PATH);
  console.log(`📦 Loaded Wasm file: ${(wasmBinary.length / 1024).toFixed(2)} KB`);

  if (!ACCOUNT_ID || !PRIVATE_KEY) {
    console.log("\n⚠️  NEAR_ACCOUNT_ID or NEAR_PRIVATE_KEY not configured.");
    console.log("To deploy to live testnet, set in .env:");
    console.log("  NEAR_ACCOUNT_ID=your-account.testnet");
    console.log("  NEAR_PRIVATE_KEY=ed25519:...");
    console.log("\nAlternatively, deploy using the near-cli-rs CLI tool:");
    console.log(`  near contract deploy ${ACCOUNT_ID || "your-account.testnet"} use-file ${WASM_PATH} without-init-call network-config testnet sign-with-keychain`);
    return;
  }

  const provider = new nearAPI.JsonRpcProvider({ url: NODE_URL });
  const keyPair = nearAPI.KeyPair.fromString(PRIVATE_KEY);
  const signer = new nearAPI.KeyPairSigner(keyPair);
  const account = new nearAPI.Account(provider, signer, ACCOUNT_ID);

  console.log(`🚀 Deploying contract code to ${ACCOUNT_ID}...`);
  const outcome = await account.deployContract(wasmBinary);
  console.log(`✅ Contract successfully deployed!`);
  console.log(`   Transaction: https://testnet.nearblocks.io/txns/${outcome.transaction.hash}`);
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});

