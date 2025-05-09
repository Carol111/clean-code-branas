import {test, expect} from "@playwright/test";

test.describe("Signup Test", async () => {
  test("Deve criar uma conta", async ({ page }) => {
    await page.goto("http://localhost:5173");
    await expect(page.locator("h1")).toHaveText("Plataforma de Trading");
  });
});