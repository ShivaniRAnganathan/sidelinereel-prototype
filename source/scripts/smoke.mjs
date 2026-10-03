import { chromium } from "playwright-core"
const url = "file:///workspace/sidelinereel-proto/dist/index.html"
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] })
const ctx = await browser.newContext({ viewport: { width: 440, height: 900 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
const errors = [], external = []
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`${m.type()}: ${m.text()}`) })
page.on("pageerror", (e) => errors.push("pageerror: " + e.message))
page.on("request", (r) => { const u = r.url(); if (!u.startsWith("file:") && !u.startsWith("data:")) external.push(u) })
await page.goto(url)
await page.waitForSelector("text=3 clips need your check before Sunday's recap")
const shot = async (n) => { await page.mouse.move(0,0); await page.waitForTimeout(400); return page.screenshot({ path: `/workspace/proto-shots/${n}.png`, fullPage: true }) }
const tab = (n) => page.getByRole("tab", { name: n }).click()
const assert = (c, m) => { if (!c) throw new Error("ASSERT: " + m); console.log("ok -", m) }

// --- initial screenshots
await shot("coach")
await tab("Parent"); await page.waitForSelector("text=Priya's reel · 2 clips"); await shot("parent")
await tab("Sunday recap"); await page.waitForSelector("text=What goes out Sunday"); await shot("recap")

// --- flow: reassign #4 -> #14
await tab("Coach")
await page.getByTestId("review-f1").getByRole("button", { name: "Reassign" }).click()
await page.getByRole("dialog").getByRole("button", { name: /Move to #14 Priya/ }).click()
await page.waitForSelector("text=2 clips need your check")
await tab("Parent")
assert(await page.getByText("Priya's reel · 3 clips").isVisible(), "reassigned clip now in Priya's reel (3)")
// parent report on a9
await page.getByTestId("reel-a9").getByRole("button", { name: "This isn't my kid" }).click()
await page.getByRole("alertdialog").getByRole("button", { name: "Remove clip" }).click()
await page.waitForSelector("text=Removed. Coach Daniel will check it.")
assert(await page.getByText("Priya's reel · 2 clips").isVisible(), "reported clip removed from reel")
await page.waitForTimeout(300); await shot("parent-after-report")
await tab("Coach")
assert(await page.getByTestId("review-a9").getByText("Parent report").isVisible(), "parent report in coach queue")
assert(await page.getByText("3 clips need your check").isVisible(), "pending count now 3")
// confirm f2
await page.getByTestId("review-f2").getByRole("button", { name: "Confirm" }).click()
// drop f3
await page.getByTestId("review-f3").getByRole("button", { name: "Drop" }).click()
await page.getByRole("alertdialog").getByRole("button", { name: "Drop clip" }).click()
await page.waitForSelector("text=1 clip needs your check")
await page.getByText(/clips auto-published/).click()
await page.waitForTimeout(300); await shot("coach-after-actions")
// recap
await tab("Sunday recap")
assert(await page.getByTestId("held-a9").isVisible(), "unreviewed parent report held in recap")
assert(await page.getByTestId("recap-k14").getByText("2 clips").isVisible(), "Priya 2 clips in recap")
await page.getByRole("button", { name: "Simulate send time" }).click()
await page.waitForSelector("[data-testid=sent-card]")
assert(await page.getByText(/1 held back, not sent as a guess/).isVisible(), "sent with 1 held")
await page.waitForTimeout(300); await shot("recap-after-send")
// reset
await page.getByRole("button", { name: "Reset demo" }).click()
await tab("Coach")
assert(await page.getByText("3 clips need your check before Sunday's recap").isVisible(), "reset restores state")

console.log("console errors/warnings:", errors.length ? errors : "none")
console.log("external requests:", external.length ? external : "none")
await browser.close()
