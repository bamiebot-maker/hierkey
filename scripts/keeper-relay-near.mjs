/**
 * Hierkey Function-Call Access Key Keeper Relayer (NEAR Protocol)
 *
 * Demonstrates the core [ 06 / SEC ] AI Security & Defense architecture:
 * "Give AI money without giving it the keys to everything."
 *
 * Instead of granting full access keys (which can drain funds or modify account contracts),
 * the keeper agent operates using a scoped Function-Call Access Key:
 *   - receiver_id: hierkey contract (e.g. hierkey.testnet)
 *   - method_names: ["prove_life"]
 *   - allowance: bounded gas / fee allowance
 *
 * The keeper monitors the vault's heartbeat interval and triggers `prove_life`
 * autonomously when the vault is due for a proof-of-life refresh.
 *
 * Environment variables:
 *   NEAR_CONTRACT_ID=hierkey.testnet
 *   NEAR_NETWORK_ID=testnet
 *   NEAR_NODE_URL=https://rpc.testnet.near.org
 *   KEEPER_ACCOUNT_ID=keeper.testnet
 *   KEEPER_PRIVATE_KEY=ed25519:...
 *
 * Usage:
 *   node scripts/keeper-relay-near.mjs <vault_id> [vault_id...]
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

const CONTRACT_ID =
  process.env.NEAR_CONTRACT_ID ||
  process.env.VITE_NEAR_CONTRACT_ID ||
  "hierkey.testnet";
const NETWORK_ID =
  process.env.NEAR_NETWORK_ID ||
  process.env.VITE_NEAR_NETWORK_ID ||
  "testnet";
const NODE_URL =
  process.env.NEAR_NODE_URL ||
  process.env.VITE_NEAR_NODE_URL ||
  "https://rpc.testnet.near.org";
const KEEPER_ACCOUNT_ID =
  process.env.KEEPER_ACCOUNT_ID || "keeper.hierkey.testnet";
const KEEPER_PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY || "";

async function main() {
  const vaultIds = process.argv.slice(2);
  if (vaultIds.length === 0) {
    console.log("Usage: node scripts/keeper-relay-near.mjs <vault_id> [vault_id...]");
    console.log("Example: node scripts/keeper-relay-near.mjs 1 2 3");
    process.exit(1);
  }

  console.log("==================================================================");
  console.log("  HIERKEY NEAR KEEPER RELAYER (Function-Call Access Key)");
  console.log("  Track: [ 06 / SEC ] AI Security & Defense");
  console.log("==================================================================");
  console.log(`Contract:      ${CONTRACT_ID}`);
  console.log(`Network:       ${NETWORK_ID} (${NODE_URL})`);
  console.log(`Keeper:        ${KEEPER_ACCOUNT_ID}`);
  console.log(`Scoped Action: receiver="${CONTRACT_ID}", methods=["prove_life"]`);
  console.log("------------------------------------------------------------------");

  const provider = new nearAPI.JsonRpcProvider({ url: NODE_URL });

  let account = null;
  if (KEEPER_PRIVATE_KEY) {
    const keyPair = nearAPI.KeyPair.fromString(KEEPER_PRIVATE_KEY);
    const signer = new nearAPI.KeyPairSigner(keyPair);
    account = new nearAPI.Account(
      provider,
      signer,
      KEEPER_ACCOUNT_ID
    );
  } else {
    console.log("ℹ️  Running in READ-ONLY / SIMULATION mode (no KEEPER_PRIVATE_KEY set)");
  }

  for (const vaultId of vaultIds) {
    console.log(`\n🔍 Checking Vault #${vaultId}...`);
    try {
      const rawVault = await provider.query({
        request_type: "call_function",
        account_id: CONTRACT_ID,
        method_name: "get_vault",
        args_base64: Buffer.from(JSON.stringify({ vault_id: String(vaultId) })).toString("base64"),
        finality: "optimistic",
      });

      const vault = JSON.parse(Buffer.from(rawVault.result).toString("utf-8"));
      if (!vault) {
        console.log(`❌ Vault #${vaultId} not found on contract.`);
        continue;
      }

      console.log(`   Owner:                 ${vault.owner}`);
      console.log(`   Name:                  ${vault.name}`);
      console.log(`   Heartbeat Interval:    ${vault.heartbeat_interval_sec}s`);
      console.log(`   Last Proof of Life:    ${vault.last_proof_of_life_sec}s`);
      console.log(`   Remaining Time:        ${vault.remaining_time_sec}s`);
      console.log(`   Authorized Keeper:     ${vault.authorized_keeper || "None"}`);
      console.log(`   Is Unlocked (Lapsed):  ${vault.is_unlocked}`);

      if (!vault.is_active) {
        console.log(`   ⚠️ Vault is terminated/inactive. Skipping.`);
        continue;
      }

      if (vault.authorized_keeper && vault.authorized_keeper !== KEEPER_ACCOUNT_ID) {
        console.log(`   ⚠️ This keeper is not authorized for Vault #${vaultId} (authorized: ${vault.authorized_keeper}). Skipping.`);
        continue;
      }

      const remainingSec = Number(vault.remaining_time_sec);
      const intervalSec = Number(vault.heartbeat_interval_sec);
      // Trigger heartbeat when remaining time is less than 50% of the interval or less than 1 hour
      const heartbeatDue = remainingSec < Math.min(intervalSec * 0.5, 3600);

      if (heartbeatDue) {
        console.log(`   ⚡ Heartbeat due! (Remaining: ${remainingSec}s / Interval: ${intervalSec}s)`);
        if (account) {
          console.log(`   🚀 Submitting scoped prove_life call via Function-Call Access Key...`);
          const outcome = await account.functionCall({
            contractId: CONTRACT_ID,
            methodName: "prove_life",
            args: { vault_id: String(vaultId) },
            gas: BigInt("30000000000000"), // 30 Tgas
            attachedDeposit: BigInt(0),
          });
          console.log(`   ✅ Proof-of-life relayed! Tx hash: ${outcome.transaction.hash}`);
        } else {
          console.log(`   💡 [Simulated Action] Would execute: near call ${CONTRACT_ID} prove_life '{"vault_id":"${vaultId}"}' --accountId ${KEEPER_ACCOUNT_ID}`);
        }
      } else {
        console.log(`   ⏳ Heartbeat is healthy. Remaining: ${remainingSec}s. No action needed.`);
      }
    } catch (err) {
      console.error(`   ❌ Failed inspecting/relaying Vault #${vaultId}:`, err.message || err);
    }
  }
  console.log("\nRelayer cycle finished.");
}

main().catch((err) => {
  console.error("Fatal relayer error:", err);
  process.exit(1);
});

