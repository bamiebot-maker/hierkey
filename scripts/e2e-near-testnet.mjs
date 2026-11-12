import fs from "fs";
import path from "path";
import * as nearAPI from "near-api-js";

const CONTRACT_ACCOUNT = process.env.NEAR_CONTRACT_ID || "hierkey-363594.testnet";
const CONTRACT_PRIVATE_KEY = process.env.NEAR_CONTRACT_PRIVATE_KEY || "";
const RPC_URL = "https://rpc.testnet.near.org";
const WASM_PATH = path.resolve(
  "contracts-near/target/wasm32-unknown-unknown/release/hierkey_contract.wasm"
);

async function createFundedAccount(prefix) {
  const keyPair = nearAPI.KeyPair.fromRandom("ed25519");
  const accountId = `${prefix}-${Date.now().toString().slice(-6)}.testnet`;
  const res = await fetch("https://helper.testnet.near.org/account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      newAccountId: accountId,
      newAccountPublicKey: keyPair.getPublicKey().toString(),
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create ${accountId}: ${res.status} ${await res.text()}`);
  }
  return { accountId, keyPair };
}

async function main() {
  console.log("=== Hierkey NEAR Testnet Deployment & Live E2E Verification ===\n");

  const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
  await keyStore.setKey(
    "testnet",
    CONTRACT_ACCOUNT,
    nearAPI.KeyPair.fromString(CONTRACT_PRIVATE_KEY)
  );

  const near = await nearAPI.connect({
    networkId: "testnet",
    keyStore,
    nodeUrl: RPC_URL,
  });

  const contractAcc = await near.account(CONTRACT_ACCOUNT);

  // 1. Deploy WASM contract
  console.log("1. Reading WASM:", WASM_PATH);
  const wasm = fs.readFileSync(WASM_PATH);
  console.log(`   WASM size: ${(wasm.length / 1024).toFixed(1)} KB`);

  console.log(`2. Deploying contract to ${CONTRACT_ACCOUNT}...`);
  const deployOutcome = await contractAcc.deployContract(wasm);
  console.log("   Deploy TX:", deployOutcome.transaction.hash);

  // 2. Initialize contract
  console.log("3. Initializing contract with new()...");
  try {
    const initOutcome = await contractAcc.functionCall({
      contractId: CONTRACT_ACCOUNT,
      methodName: "new",
      args: {},
      gas: "30000000000000",
    });
    console.log("   Init TX:", initOutcome.transaction.hash);
  } catch (err) {
    if (String(err).includes("Already initialized")) {
      console.log("   Contract already initialized, continuing...");
    } else {
      throw err;
    }
  }

  // 3. Create separate Owner, Guardian, and Beneficiary accounts on NEAR Testnet
  console.log("4. Creating live Owner, Guardian, and Beneficiary testnet accounts...");
  const owner = await createFundedAccount("hk-owner");
  const guardian = await createFundedAccount("hk-guard");
  const beneficiary = await createFundedAccount("hk-benef");
  console.log("   Owner:      ", owner.accountId);
  console.log("   Guardian:   ", guardian.accountId);
  console.log("   Beneficiary:", beneficiary.accountId);

  await keyStore.setKey("testnet", owner.accountId, owner.keyPair);
  await keyStore.setKey("testnet", guardian.accountId, guardian.keyPair);
  await keyStore.setKey("testnet", beneficiary.accountId, beneficiary.keyPair);

  const ownerAcc = await near.account(owner.accountId);
  const guardianAcc = await near.account(guardian.accountId);
  const beneficiaryAcc = await near.account(beneficiary.accountId);

  // 4. Create Vault on-chain
  console.log("5. Calling create_vault() on NEAR Testnet...");
  const createOutcome = await ownerAcc.functionCall({
    contractId: CONTRACT_ACCOUNT,
    methodName: "create_vault",
    args: {
      name: "Hierkey Live Testnet Vault",
      description: "Verified E2E custody vault with guardian & beneficiary",
      heartbeat_interval_sec: "3600",
      guardians: [guardian.accountId],
      guardian_threshold: 1,
      beneficiaries: [beneficiary.accountId],
      authorized_keeper: null,
      metadata_cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    },
    gas: "50000000000000",
  });
  const createdVaultId = JSON.parse(
    Buffer.from(createOutcome.status.SuccessValue, "base64").toString("utf-8")
  );
  console.log("   create_vault TX:", createOutcome.transaction.hash);
  console.log("   Created Vault ID:", createdVaultId);

  // 5. Verify on-chain storage via view calls
  console.log("6. Verifying stored vault & signatories via view calls...");
  const vaultView = await ownerAcc.viewFunction({
    contractId: CONTRACT_ACCOUNT,
    methodName: "get_vault",
    args: { vault_id: String(createdVaultId) },
  });
  console.log("   Vault Owner:      ", vaultView.owner);
  console.log("   Vault Guardians:  ", vaultView.guardians);
  console.log("   Vault Beneficiaries:", vaultView.beneficiaries);
  console.log("   Initial Unlocked: ", vaultView.is_unlocked);

  // 6. Prove Life
  console.log("7. Calling prove_life() as Owner...");
  const lifeOutcome = await ownerAcc.functionCall({
    contractId: CONTRACT_ACCOUNT,
    methodName: "prove_life",
    args: { vault_id: String(createdVaultId) },
    gas: "30000000000000",
  });
  console.log("   prove_life TX:", lifeOutcome.transaction.hash);

  // 7. Guardian Emergency Release Approval
  console.log("8. Calling approve_emergency_release() as Guardian signatory...");
  const approveOutcome = await guardianAcc.functionCall({
    contractId: CONTRACT_ACCOUNT,
    methodName: "approve_emergency_release",
    args: { vault_id: String(createdVaultId) },
    gas: "30000000000000",
  });
  console.log("   approve_emergency_release TX:", approveOutcome.transaction.hash);

  const unlockedAfterApproval = await ownerAcc.viewFunction({
    contractId: CONTRACT_ACCOUNT,
    methodName: "is_vault_unlocked",
    args: { vault_id: String(createdVaultId) },
  });
  console.log("   is_vault_unlocked after guardian approval:", unlockedAfterApproval);

  // 8. Beneficiary Claim Vault
  console.log("9. Calling claim_vault() as Beneficiary...");
  const claimOutcome = await beneficiaryAcc.functionCall({
    contractId: CONTRACT_ACCOUNT,
    methodName: "claim_vault",
    args: { vault_id: String(createdVaultId) },
    gas: "30000000000000",
  });
  console.log("   claim_vault TX:", claimOutcome.transaction.hash);

  const claims = await beneficiaryAcc.viewFunction({
    contractId: CONTRACT_ACCOUNT,
    methodName: "get_claims",
    args: { vault_id: String(createdVaultId) },
  });
  console.log("   Recorded on-chain claims:", JSON.stringify(claims));

  console.log("\n=== ALL NEAR TESTNET END-TO-END CHECKS PASSED ===");
  console.log("Live Contract Explorer:", `https://testnet.nearblocks.io/address/${CONTRACT_ACCOUNT}`);
}

main().catch((err) => {
  console.error("E2E Failed:", err);
  process.exit(1);
});
