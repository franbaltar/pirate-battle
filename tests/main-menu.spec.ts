import { expect, test } from "@playwright/test";

test("should display the main menu", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Pirate Battle" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "PLAY" })).toBeVisible();
  await expect(page.getByRole("button", { name: "OPTIONS" })).toBeVisible();
  await expect(page.getByRole("button", { name: "RANKING" })).toBeVisible();
  await expect(page.getByRole("button", { name: "HISTORY" })).toBeVisible();
});
