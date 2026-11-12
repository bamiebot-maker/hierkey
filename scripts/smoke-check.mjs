import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const envPath = path.join(root, ".env");
const envExamplePath = path.join(root, ".env.example");

const readEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    env[key] = value;
  }
  return env;
};

const localEnv = readEnvFile(envPath);
const sampleEnv = readEnvFile(envExamplePath);
const env = { ...sampleEnv, ...localEnv };

const sorobanRpc = env.VITE_STELLAR_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
const horizonUrl = env.VITE_STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
const stellarAddress = env.VITE_STELLAR_CONTRACT_ADDRESS;

const assertStep = async (name, fn) => {
  try {
    const value = await fn();
    console.log(`PASS: ${name}${value ? ` -> ${value}` : ""}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL: ${name} -> ${message}`);
    process.exit(1);
  }
};

// 1. Check Soroban Testnet RPC
await assertStep("Soroban RPC Health", async () => {
  const res = await fetch(sorobanRpc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getHealth",
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result?.status || "healthy";
});

// 2. Check Stellar Horizon
await assertStep("Stellar Horizon Connectivity", async () => {
  const res = await fetch(`${horizonUrl}/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return `network_passphrase: "${data.network_passphrase}"`;
});

// 3. Contract check if configured
if (stellarAddress && /^C[A-Z2-7]{55}$/.test(stellarAddress)) {
  console.log(`PASS: Stellar Soroban Contract Configured -> ${stellarAddress}`);
} else {
  console.log("INFO: VITE_STELLAR_CONTRACT_ADDRESS not yet deployed to testnet (ready for Phase 2)");
}

console.log("PASS: SpooVault Stellar smoke check complete");
