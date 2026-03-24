import { test, expect } from "@playwright/test";

test.describe("WebSocket Real-time Updates", () => {
  // test("should receive depth updates in real-time", async ({
  //   page,
  //   context,
  // }) => {
  //   const page1 = await context.newPage();
  //   await page1.goto("http://localhost:5173");

  //   await page1.waitForSelector("text=🟢 Connected");

  //   const page2 = await context.newPage();
  //   await page2.goto("http://localhost:5173");

  //   // TODO: preencher formulário de criação de ordem na página 2
  //   await page2.fill(".input-name", "Test User");
  //   // ... mais campos
  //   // Criar ordem
  //   await page2.click(".button-confirm");
  //   // Verificar que página 1 recebeu atualização
  //   const buyOrders1 = await page1.locator("text=Buy Orders").count();
  //   expect(buyOrders1).toBeGreaterThan(0);
  // });

  test("should show connection status", async ({ page }) => {
    await page.goto("http://localhost:5173");

    await expect(page.locator("text=🟢 Connected")).toBeVisible();

    await expect(page.locator("text=Market Depth")).toBeVisible();
  });

  test("should handle market switching", async ({ page }) => {
    await page.goto("http://localhost:5173");

    await expect(page.locator("text=Market Depth - BTC/USD")).toBeVisible();

    await page.selectOption("select", "USD/BTC");

    await expect(page.locator("text=Market Depth - USD/BTC")).toBeVisible();

    await expect(page.locator("text=🟢 Connected")).toBeVisible();
  });
});
