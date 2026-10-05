import { defineConfig, devices } from '@playwright/test'
import fs from 'node:fs'

const chromium = fs.readdirSync('/opt/pw-browsers').find((d) => d.startsWith('chromium-'))
const exe = process.env.PW_CHROMIUM ?? (chromium ? `/opt/pw-browsers/${chromium}/chrome-linux/chrome` : undefined)

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    launchOptions: exe && fs.existsSync(exe) ? { executablePath: exe } : {},
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 375, height: 812 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
