import { expect, test } from "@playwright/test";

test("should display the ranking", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "RANKING" }).click();

  await expect(page.getByRole("heading", { name: "RANKING" })).toBeVisible();
  await expect(page.getByText("Captain Redwake")).toBeVisible();
  await expect(page.getByText("9800")).toBeVisible();
  await expect(page.getByText("Mara Stormhook")).toBeVisible();
  await expect(page.getByRole("button", { name: "BACK" })).toBeVisible();
});
