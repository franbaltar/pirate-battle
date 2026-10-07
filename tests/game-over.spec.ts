import { expect, test } from "@playwright/test";

test("should show Game Over when the game ends", async ({ page }) => {
  test.setTimeout(45_000);

  await page.goto("/");
  await page.getByRole("button", { name: "OPTIONS" }).click();
  await page.getByLabel("Game duration").selectOption("30");
  await page.getByRole("button", { name: "BACK" }).click();
  await page.getByRole("button", { name: "PLAY" }).click();

  await expect(page.getByRole("heading", { name: "GAME OVER" })).toBeVisible({
    timeout: 40_000,
  });
});
