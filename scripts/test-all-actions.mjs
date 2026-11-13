import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  await context.addInitScript(() => {
    window.localStorage.setItem("hierkey-ecosystem", "near");
    window.localStorage.setItem("hierkey-near-readonly-account", "bamiebot-hierkey.testnet");
    window.localStorage.setItem("hierkey-profile", JSON.stringify({ nickname: "Bamiebot" }));
  });

  const page = await context.newPage();
  page.on("console", (msg) => console.log(`[BROWSER ${msg.type()}]:`, msg.text()));

  fs.mkdirSync("test_screenshots", { recursive: true });

  console.log("1. Navigating to /vaults...");
  await page.goto("http://localhost:3000/vaults", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  await page.screenshot({ path: "test_screenshots/01_vaults_initial.png" });

  console.log("2. Opening Create Vault modal...");
  const createBtn = page.getByRole("button", { name: /create.*vault/i }).first();
  await createBtn.click();
  await sleep(1000);
  await page.screenshot({ path: "test_screenshots/02_vault_modal_open.png" });

  console.log("3. Filling vault form...");
  await page.getByPlaceholder(/e\.g\., Family Estate Records/i).fill("Sovereign Heritage Trust");
  await page.getByPlaceholder(/Describe which files/i).fill("Confidential multi-guardian recovery vault with 60-day heartbeat.");
  await page.getByPlaceholder(/Enter guardian's NEAR account ID/i).fill("guardian-alpha.testnet");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await sleep(500);
  await page.getByPlaceholder(/Enter beneficiary's NEAR account ID/i).fill("beneficiary-family.testnet");
  await sleep(500);
  await page.screenshot({ path: "test_screenshots/03_vault_modal_filled.png" });

  console.log("4. Submitting Create Vault...");
  const submitVaultBtn = page.locator('footer button:has-text("Create Access Vault")');
  await submitVaultBtn.click();
  await sleep(3000);
  await page.screenshot({ path: "test_screenshots/04_vault_created.png" });

  console.log("5. Testing Prove Life on Vault Card...");
  const proveLifeBtn = page.locator('button:has-text("Prove Life")').first();
  const isProveVisible = await proveLifeBtn.isVisible();
  console.log("Prove Life button visible?", isProveVisible);
  if (isProveVisible) {
    await proveLifeBtn.click();
    await sleep(2000);
    await page.screenshot({ path: "test_screenshots/05_prove_life_clicked.png" });
  }

  console.log("6. Navigating to /documents...");
  await page.goto("http://localhost:3000/documents", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  await page.screenshot({ path: "test_screenshots/06_documents_initial.png" });

  console.log("7. Opening Upload Document modal...");
  const uploadBtn = page.locator('button:has-text("Upload Document")').first();
  await uploadBtn.click();
  await sleep(1000);
  await page.screenshot({ path: "test_screenshots/07_upload_modal_open.png" });

  console.log("8. Setting file and checking form fields...");
  await page.evaluate(() => {
    const file = new File(
      ["Hierkey confidential backup seed phrase: abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"],
      "sample-backup-key.txt",
      { type: "text/plain" }
    );
    if (window.__hierkey_setDemoFile) window.__hierkey_setDemoFile(file);
  });
  await sleep(1000);
  await page.screenshot({ path: "test_screenshots/08_file_set.png" });

  console.log("9. Submitting Document Upload...");
  const submitUploadBtn = page.locator('footer button:has-text("Upload Document")');
  const isUploadEnabled = await submitUploadBtn.isEnabled();
  console.log("Submit Upload Button enabled?", isUploadEnabled);
  if (isUploadEnabled) {
    await submitUploadBtn.click();
    console.log("Upload clicked, waiting for encryption and IPFS...");
    await sleep(4000);
    await page.screenshot({ path: "test_screenshots/09_upload_processing_or_key_modal.png" });

    // Handle key modal
    const keyModalCheckbox = page.locator('input[type="checkbox"]').first();
    if (await keyModalCheckbox.isVisible()) {
      console.log("Checking key modal checkbox...");
      await keyModalCheckbox.check();
      await sleep(500);
      await page.screenshot({ path: "test_screenshots/10_key_modal_checked.png" });

      const closeBtn = page.locator('footer button:has-text("Close")').first();
      await closeBtn.click();
      await sleep(2000);
      await page.screenshot({ path: "test_screenshots/11_documents_table_after_upload.png" });
    }
  }

  await browser.close();
  console.log("Done testing!");
}

run().catch(console.error);

