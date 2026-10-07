import { expect, test } from "@playwright/test";

test("should enter the game and display the canvas", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Pirate Battle" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "PLAY" }).click();
  await expect(page.locator("canvas")).toBeVisible();
});
