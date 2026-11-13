import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function smoothScroll(page, targetY, durationMs = 1200) {
  await page.evaluate(async ({ targetY, durationMs }) => {
    const startY = window.scrollY;
    const diff = targetY - startY;
    const startTime = performance.now();
    await new Promise((resolve) => {
      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
        window.scrollTo(0, startY + diff * ease);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }, { targetY, durationMs });
}

async function run() {
  const outputDir = path.resolve("recordings/video_raw");
  if (fs.existsSync(outputDir)) {
    for (const f of fs.readdirSync(outputDir)) {
      if (f.endsWith(".webm")) {
        fs.unlinkSync(path.join(outputDir, f));
      }
    }
  } else {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Launching Chromium for 1080p demo recording (Christopher voice)...");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1920,1080",
      "--hide-scrollbars",
      "--disable-gpu-vsync",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 },
    },
  });

  // Pre-seed connected state
  await context.addInitScript(() => {
    window.localStorage.setItem("hierkey-ecosystem", "near");
    window.localStorage.setItem("hierkey-near-readonly-account", "bamiebot-hierkey.testnet");
    window.localStorage.setItem("hierkey-profile", JSON.stringify({ nickname: "Bamiebot" }));
  });

  const page = await context.newPage();

  // ==========================================
  // SCENE 1: Introduction (Landing Page) ~18s
  // ==========================================
  console.log("Scene 1: Landing Page (0:00 - 0:18)...");
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await sleep(1500);

  // Smooth scroll through hero and architecture pillars
  await smoothScroll(page, 750, 2200);
  await sleep(1500);
  await smoothScroll(page, 1500, 2200);
  await sleep(1500);
  await smoothScroll(page, 0, 1600);
  await sleep(1000);

  // ==========================================
  // SCENE 2: Dashboard Overview & Sidebar ~18.5s
  // ==========================================
  console.log("Scene 2: Dashboard Overview & Sidebar (0:18 - 0:36.5)...");
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "domcontentloaded" });
  await sleep(1600);

  // Toggle sidebar collapse to show sleek icon rail
  const sidebarToggle = page.locator('aside button[aria-label="Collapse sidebar"], aside button[aria-label="Expand sidebar"]').first();
  if (await sidebarToggle.isVisible()) {
    await sidebarToggle.click();
    await sleep(1600);
    // Expand back
    await sidebarToggle.click();
    await sleep(1600);
  }

  // Scroll through telemetry & keeper bot relays
  await smoothScroll(page, 450, 2000);
  await sleep(1600);
  await smoothScroll(page, 850, 2000);
  await sleep(1600);
  await smoothScroll(page, 0, 1400);
  await sleep(1000);

  // ==========================================
  // SCENE 3: Live Access Vault Creation & Heartbeat ~17.5s
  // ==========================================
  console.log("Scene 3: Live Access Vault Creation & Heartbeat (0:36.5 - 0:54)...");
  await page.goto("http://localhost:3000/vaults", { waitUntil: "domcontentloaded" });
  await sleep(1500);

  // Click Create Access Vault
  const createVaultBtn = page.getByRole("button", { name: /create.*vault/i }).first();
  await createVaultBtn.click();
  await sleep(600);

  // Fill form fields dynamically
  const nameInput = page.getByPlaceholder(/e\.g\., Family Estate Records/i);
  await nameInput.fill("Sovereign Heritage Trust");
  await sleep(400);

  const descInput = page.getByPlaceholder(/Describe which files/i);
  await descInput.fill("Confidential multi-guardian recovery vault with 60-day heartbeat.");
  await sleep(400);

  const guardianInput = page.getByPlaceholder(/Enter guardian's NEAR account ID/i);
  await guardianInput.fill("guardian-alpha.testnet");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await sleep(500);

  const benInput = page.getByPlaceholder(/Enter beneficiary's NEAR account ID/i);
  await benInput.fill("beneficiary-family.testnet");
  await sleep(500);

  // Submit form
  console.log("Submitting Create Access Vault...");
  const submitVaultBtn = page.locator('footer button:has-text("Create Access Vault")');
  await submitVaultBtn.click();

  // Watch optimistic vault card appear and hold
  await sleep(3500);

  // Test Prove Life heartbeat live on the new vault card!
  const proveLifeBtn = page.locator('button:has-text("Prove Life")').first();
  if (await proveLifeBtn.isVisible()) {
    console.log("Clicking Prove Life button...");
    await proveLifeBtn.hover();
    await sleep(400);
    await proveLifeBtn.click();
    await sleep(2500);
  }

  // ==========================================
  // SCENE 4: Encrypted Document Custody & Pinata IPFS ~17s
  // ==========================================
  console.log("Scene 4: Encrypted Document Custody & Pinata IPFS (0:54 - 0:71)...");
  await page.goto("http://localhost:3000/documents", { waitUntil: "domcontentloaded" });
  await sleep(1500);

  const uploadDocBtn = page.locator('button:has-text("Upload Document")').first();
  await uploadDocBtn.click();
  await sleep(800);

  // Select file and ensure vault is selected
  await page.evaluate(() => {
    const file = new File(
      ["Hierkey confidential backup seed phrase: abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"],
      "sample-backup-key.txt",
      { type: "text/plain" }
    );
    if ((window).__hierkey_setDemoFile) (window).__hierkey_setDemoFile(file);
  });
  await sleep(600);

  // Select Access Level: read_write
  const readWriteRadio = page.locator('input[value="1"], label:has-text("read_write")').first();
  if (await readWriteRadio.isVisible()) {
    await readWriteRadio.click();
    await sleep(400);
  }

  // Submit upload
  console.log("Submitting Document Upload...");
  const submitUploadBtn = page.locator('footer button:has-text("Upload Document")');
  await submitUploadBtn.click();

  // Wait for client-side encryption and IPFS pinning
  await sleep(3500);

  // Show encryption key modal, check the backup confirmation, then close
  const keyModalCheckbox = page.locator('input[type="checkbox"]').first();
  if (await keyModalCheckbox.isVisible()) {
    await sleep(800);
    await keyModalCheckbox.check();
    await sleep(600);
    const closeKeyModal = page.locator('footer button:has-text("Close")').first();
    await closeKeyModal.click();
    await sleep(1000);
  }

  // Hold on documents table to clearly show the live uploaded document in the table!
  await sleep(4500);

  // ==========================================
  // SCENE 5: Architecture, Security & Conclusion ~18s
  // ==========================================
  console.log("Scene 5: Architecture, Security & Conclusion (0:71 - 0:89)...");
  await page.goto("http://localhost:3000/docs", { waitUntil: "domcontentloaded" });
  await sleep(1600);
  await smoothScroll(page, 600, 2200);
  await sleep(1600);
  await smoothScroll(page, 1200, 2200);
  await sleep(3000);

  console.log("Recording completed successfully! Flushing video to disk...");
  await page.close();
  await context.close();
  await browser.close();

  await sleep(3000);
  const files = fs.readdirSync(outputDir).filter((f) => f.endsWith(".webm"));
  if (files.length > 0) {
    const rawVideo = path.join(outputDir, files[0]);
    console.log("SUCCESS! Raw video recorded at:", rawVideo, "Size:", fs.statSync(rawVideo).size, "bytes");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
