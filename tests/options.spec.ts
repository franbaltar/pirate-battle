import { expect, test } from "@playwright/test";

test("should persist game settings after reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "OPTIONS" }).click();

  await expect(page.getByRole("heading", { name: "Options" })).toBeVisible();

  const durationSelect = page.getByLabel("Game duration");
  const spawnRateSelect = page.getByLabel("Enemy spawn rate");

  await durationSelect.selectOption("90");
  await spawnRateSelect.selectOption("high");
  await page.reload();

  await page.getByRole("button", { name: "OPTIONS" }).click();

  await expect(durationSelect).toHaveValue("90");
  await expect(spawnRateSelect).toHaveValue("high");
});
