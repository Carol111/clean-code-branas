import { test, expect } from "@playwright/test";

test.describe("WebSocket Real-time Updates", () => {
  test("should receive depth updates in real-time", async ({
    page,
    context,
  }) => {
    // Abre página 1 (observando BTC/USD)
    const page1 = await context.newPage();
    await page1.goto("http://localhost:5173");

    // Aguarda conexão
    await page1.waitForSelector("text=🟢 Connected");

    // Abre página 2 (criará ordem)
    const page2 = await context.newPage();
    await page2.goto("http://localhost:5173");

    // Preencher formulário de signup e criar ordem
    await page2.fill(".input-name", "Test User");
    // ... mais campos

    // Criar ordem
    await page2.click(".button-confirm");

    // Verificar que página 1 recebeu atualização
    const buyOrders1 = await page1.locator("text=Buy Orders").count();
    expect(buyOrders1).toBeGreaterThan(0);
  });

  test("should show connection status", async ({ page }) => {
    await page.goto("http://localhost:5173");

    // Verificar status conectado
    await expect(page.locator("text=🟢 Connected")).toBeVisible();

    // Verificar depth exibida
    await expect(page.locator("text=Market Depth")).toBeVisible();
  });

  test("should handle market switching", async ({ page }) => {
    await page.goto("http://localhost:5173");

    // Verificar BTC/USD inicial
    await expect(page.locator("text=Market Depth - BTC/USD")).toBeVisible();

    // Trocar mercado
    await page.selectOption("select", "USD/BTC");

    // Verificar mudança
    await expect(page.locator("text=Market Depth - USD/BTC")).toBeVisible();

    // Verificar que ainda está conectado
    await expect(page.locator("text=🟢 Connected")).toBeVisible();
  });
});
