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
    // Clean old raw webm files
    for (const f of fs.readdirSync(outputDir)) {
      if (f.endsWith(".webm")) {
        fs.unlinkSync(path.join(outputDir, f));
      }
    }
  } else {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Launching Chromium for 1080p high-framerate demo recording...");
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
  // SCENE 1: Introduction (Landing Page) ~16.0s
  // ==========================================
  console.log("Scene 1: Landing Page (0:00 - 0:16)...");
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await sleep(2000);

  // Smooth scroll through landing page features
  await smoothScroll(page, 750, 2500);
  await sleep(1500);
  await smoothScroll(page, 1400, 2500);
  await sleep(1500);
  await smoothScroll(page, 0, 1800);
  await sleep(1200);

  // Click Launch App or navigate to Dashboard
  console.log("Transitioning to Dashboard...");
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "domcontentloaded" });

  // ==========================================
  // SCENE 2: Dashboard Overview & Sidebar ~16.5s
  // ==========================================
  console.log("Scene 2: Dashboard Overview & Sidebar (0:16 - 0:32.5)...");
  await sleep(2000);

  // Toggle sidebar collapse to demonstrate responsive icon rail
  const sidebarToggle = page.locator('aside button[aria-label="Collapse sidebar"], aside button[aria-label="Expand sidebar"]').first();
  if (await sidebarToggle.isVisible()) {
    await sidebarToggle.click();
    await sleep(1500);
    // Expand back
    await sidebarToggle.click();
    await sleep(1500);
  }

  // Scroll through telemetry, keeper bot relays, and heartbeat countdown
  await smoothScroll(page, 450, 2000);
  await sleep(2000);
  await smoothScroll(page, 850, 2000);
  await sleep(2000);
  await smoothScroll(page, 0, 1500);
  await sleep(1000);

  // ==========================================
  // SCENE 3: Access Vaults Creation ~15.0s
  // ==========================================
  console.log("Scene 3: Live Access Vault Creation (0:32.5 - 0:47.5)...");
  await page.goto("http://localhost:3000/vaults", { waitUntil: "domcontentloaded" });
  await sleep(1500);

  // Click Create Access Vault
  const createVaultBtn = page.getByRole("button", { name: /create.*vault/i }).first();
  if (await createVaultBtn.isVisible()) {
    await createVaultBtn.click();
    await sleep(800);

    // Fill form fields dynamically
    const nameInput = page.getByPlaceholder(/e\.g\., Family Estate Records/i);
    await nameInput.fill("Sovereign Heritage Trust");
    await sleep(500);

    const descInput = page.getByPlaceholder(/Describe which files/i);
    await descInput.fill("Confidential multi-guardian recovery vault with 60-day heartbeat.");
    await sleep(600);

    const guardianInput = page.getByPlaceholder(/Enter guardian's NEAR account ID/i);
    await guardianInput.fill("guardian-alpha.testnet");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await sleep(600);

    const benInput = page.getByPlaceholder(/Enter beneficiary's NEAR account ID/i);
    await benInput.fill("beneficiary-family.testnet");
    await sleep(600);

    // Submit form
    const submitBtn = page.locator('footer button:has-text("Create Access Vault")');
    await submitBtn.click();
    // Watch optimistic vault card appear
    await sleep(3500);
  }

  // ==========================================
  // SCENE 4: Encrypted Document Custody & IPFS ~15.5s
  // ==========================================
  console.log("Scene 4: Encrypted Document Custody & Pinata IPFS (0:47.5 - 0:63)...");
  await page.goto("http://localhost:3000/documents", { waitUntil: "domcontentloaded" });
  await sleep(1500);

  const uploadBtn = page.locator('button:has-text("Upload Document")').first();
  if (await uploadBtn.isVisible()) {
    await uploadBtn.click();
    await sleep(800);

    // Set demo file & ensure vault is selected
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
    const submitDocBtn = page.locator('footer button:has-text("Upload Document")');
    if (await submitDocBtn.isEnabled()) {
      await submitDocBtn.click();
      // Wait for client-side encryption and IPFS pinning
      await sleep(4000);

      // Close key backup modal if shown
      const closeKeyModal = page.locator('button:has-text("I Have Saved My Key"), button:has-text("Done"), button[aria-label="Close"]').first();
      if (await closeKeyModal.isVisible()) {
        await closeKeyModal.click();
        await sleep(1000);
      }
    }
  }

  // ==========================================
  // SCENE 5: Proof of Life Heartbeat & Conclusion ~16.5s
  // ==========================================
  console.log("Scene 5: Proof of Life Heartbeat & Conclusion (0:63 - 0:79.5)...");
  await page.goto("http://localhost:3000/vaults", { waitUntil: "domcontentloaded" });
  await sleep(1500);

  // Click Prove Life button on the vault card
  const proveLifeBtn = page.locator('button:has-text("Prove Life")').first();
  if (await proveLifeBtn.isVisible()) {
    await proveLifeBtn.hover();
    await sleep(600);
    await proveLifeBtn.click();
    await sleep(2500);
  }

  // Show live NEAR Testnet connection & status
  await smoothScroll(page, 300, 1500);
  await sleep(2000);

  // Navigate to Docs & Architecture for crisp finale
  await page.goto("http://localhost:3000/docs", { waitUntil: "domcontentloaded" });
  await sleep(1500);
  await smoothScroll(page, 450, 2000);
  await sleep(2500);

  console.log("Recording finished! Finalizing video stream...");
  await page.close();
  await context.close();
  await browser.close();

  console.log("Browser closed. Waiting 3 seconds for video file flush...");
  await sleep(3000);

  const files = fs.readdirSync(outputDir).filter((f) => f.endsWith(".webm"));
  if (files.length > 0) {
    const rawVideo = path.join(outputDir, files[0]);
    console.log("SUCCESS! Recorded raw video:", rawVideo, "Size:", fs.statSync(rawVideo).size, "bytes");
  } else {
    console.error("No webm video found in", outputDir);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
