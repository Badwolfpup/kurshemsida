import { chromium } from "playwright";
import { readFileSync, renameSync } from "fs";
import path from "path";

const LOGINS = {
  student: "test.elev@gmail.com",
  coach: "coachen@hudiksvall.se",
  teacher: "teacher@hudiksvall.se",
};

const VIEWPORT = { width: 1920, height: 1080 };

export async function recordWalkthrough(walkthrough, durations) {
  const { role, startUrl, outputName, steps } = walkthrough;
  const email = LOGINS[role];
  if (!email) throw new Error(`Unknown role: ${role}`);

  const durationMap = new Map(durations.map((d) => [d.id, d.durationMs]));

  console.log(`  [record] Launching browser...`);
  const browser = await chromium.launch({ headless: false });

  // --- Phase 1: Login (no video) ---
  const loginContext = await browser.newContext({ viewport: VIEWPORT });
  const loginPage = await loginContext.newPage();

  console.log(`  [record] Logging in as ${role} (${email})...`);
  await loginPage.goto("http://localhost:5173/login", { waitUntil: "networkidle" });

  // Fill email and submit
  await loginPage.fill('input[type="email"]', email);
  await loginPage.click('button[type="submit"]');

  // Wait for passcode step (dev mode auto-fills the passcode)
  await loginPage.waitForSelector('input[inputmode="numeric"]', { timeout: 10000 });
  // Small wait for React state to update with auto-filled passcode
  await loginPage.waitForTimeout(500);

  // Submit passcode
  await loginPage.click('button[type="submit"]');

  // Wait for navigation to complete (login redirects to /)
  await loginPage.waitForURL("**/", { timeout: 10000 });
  await loginPage.waitForTimeout(1000);

  // Suppress auto-opening dialogs (ChangelogDialog checks this key)
  await loginPage.evaluate(() => {
    localStorage.setItem("changelog_last_seen", new Date().toISOString().split("T")[0]);
  });

  // Save storage state (cookies + localStorage)
  const storageState = await loginContext.storageState();
  await loginContext.close();

  // --- Phase 2: Record walkthrough ---
  const videoDir = path.resolve("output/video");
  const recordContext = await browser.newContext({
    viewport: VIEWPORT,
    storageState,
    recordVideo: { dir: videoDir, size: VIEWPORT },
  });

  const page = await recordContext.newPage();

  // Navigate to start URL
  console.log(`  [record] Navigating to ${startUrl}...`);
  await page.goto(startUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Dismiss any unexpected overlay/dialog
  const overlay = page.locator('[data-state="open"][aria-hidden="true"]');
  if (await overlay.count() > 0) {
    console.log(`  [record] Dismissing overlay dialog...`);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  }

  // Execute steps
  for (const step of steps) {
    const audioDuration = durationMap.get(step.id) || 0;
    const waitMs = Math.max(step.pauseMs || 0, audioDuration);

    console.log(`  [record] Step ${step.id}: ${step.action} (wait ${waitMs}ms)`);

    switch (step.action) {
      case "navigate":
        await page.goto(step.url || startUrl, { waitUntil: "networkidle" });
        break;
      case "click":
        try {
          await page.click(step.selector, { timeout: 5000 });
        } catch (e) {
          console.warn(`  [record] Warning: click failed for "${step.selector}": ${e.message}`);
        }
        break;
      case "fill":
        try {
          await page.fill(step.selector, step.value || "", { timeout: 5000 });
        } catch (e) {
          console.warn(`  [record] Warning: fill failed for "${step.selector}": ${e.message}`);
        }
        break;
      case "select":
        // Two-step: click trigger to open dropdown, then click option
        try {
          await page.click(step.selector, { timeout: 5000 });
          await page.waitForTimeout(300);
          await page.click(step.option, { timeout: 5000 });
        } catch (e) {
          console.warn(`  [record] Warning: select failed for "${step.selector}" → "${step.option}": ${e.message}`);
        }
        break;
      case "hover":
        try {
          await page.hover(step.selector, { timeout: 5000 });
        } catch (e) {
          console.warn(`  [record] Warning: hover failed for "${step.selector}": ${e.message}`);
        }
        break;
      case "press":
        try {
          await page.press(step.selector || "body", step.key || "Enter", { timeout: 5000 });
        } catch (e) {
          console.warn(`  [record] Warning: press failed: ${e.message}`);
        }
        break;
      case "scroll":
        await page.evaluate(() => window.scrollBy(0, 400));
        break;
      case "wait_for":
        // Wait for an element to appear (useful for async operations)
        try {
          const timeout = step.waitMs || 60000;
          console.log(`  [record]   Waiting for "${step.selector}" (up to ${timeout}ms)...`);
          await page.waitForSelector(step.selector, { timeout });
        } catch (e) {
          console.warn(`  [record] Warning: wait_for timed out for "${step.selector}": ${e.message}`);
        }
        break;
      case "evaluate":
        // Run arbitrary JS in the page context
        try {
          await page.evaluate(step.script);
        } catch (e) {
          console.warn(`  [record] Warning: evaluate failed: ${e.message}`);
        }
        break;
      case "screenshot_pause":
        // Just wait — the video is recording
        break;
      default:
        console.warn(`  [record] Unknown action: ${step.action}`);
    }

    await page.waitForTimeout(waitMs);
  }

  // Extra pause at end
  await page.waitForTimeout(1500);

  // Close to finalize video
  const videoPath = await page.video().path();
  await recordContext.close();
  await browser.close();

  // Rename to expected output name
  const finalVideoPath = path.resolve(`output/video/${outputName}.webm`);
  renameSync(videoPath, finalVideoPath);
  console.log(`  [record] Video saved: ${finalVideoPath}`);

  return finalVideoPath;
}
