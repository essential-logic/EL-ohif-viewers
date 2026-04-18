import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log('Could not reach localhost:3000. Is the dev server still compiling?');
    process.exit(1);
  }

  // Allow animations to finish
  await page.waitForTimeout(4000);

  // Capture Login Page
  console.log('Capturing login.png...');
  await page.screenshot({ path: path.join(outDir, 'login.png') });

  console.log('Screenshot of Login UI captured successfully! Because full authenticated screens require real DICOM data/verfied accounts, other screenshots should be added manually during usage.');
  await browser.close();
}

run().catch(console.error);
