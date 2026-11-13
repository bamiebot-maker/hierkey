import { chromium } from "playwright";

async function inspectModal() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  await context.addInitScript(() => {
    window.localStorage.setItem("hierkey-ecosystem", "near");
    window.localStorage.setItem("hierkey-near-readonly-account", "bamiebot-hierkey.testnet");
    window.localStorage.setItem("hierkey-profile", JSON.stringify({ nickname: "Bamiebot" }));
  });

  const page = await context.newPage();
  page.on("console", (msg) => console.log("BROWSER:", msg.text()));

  await page.goto("http://localhost:3000/documents", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // Pre-seed an optimistic vault in cache so we don't have to create one
  await page.evaluate(async () => {
    const { writeVaultsCache } = await import("/src/services/offline/offlineCache.service.ts");
    await writeVaultsCache("bamiebot-hierkey.testnet", "near", [{
      id: 9999,
      creator: "bamiebot-hierkey.testnet",
      name: "Sovereign Heritage Trust",
      description: "Dead man switch",
      guardians: ["bamiebot-hierkey.testnet"],
      approvalThreshold: 1,
      isActive: true,
      createdAt: Date.now(),
    }]);
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  await page.locator('button:has-text("Upload Document")').first().click();
  await page.waitForTimeout(800);

  // Set file and vault
  await page.evaluate(() => {
    const file = new File(["Hierkey confidential backup seed phrase"], "sample-backup-key.txt", { type: "text/plain" });
    if ((window).__hierkey_setDemoFile) (window).__hierkey_setDemoFile(file);
    if ((window).__hierkey_setDemoVault) (window).__hierkey_setDemoVault(9999);
  });

  await page.waitForTimeout(500);

  console.log("Checking upload button status...");
  const uploadBtn = page.locator('footer button:has-text("Upload Document")');
  console.log("Upload button enabled:", await uploadBtn.isEnabled());
  await uploadBtn.click();
  await page.waitForTimeout(4000);

  console.log("Upload completed!");
  await browser.close();
}

inspectModal().catch(console.error);
