import { expect, test } from "@playwright/test";

async function loginAs(
  page: import("@playwright/test").Page,
  credentials: { ci: string; password: string }
) {
  await page.goto("/login");
  await page.fill("#login-ci", credentials.ci);
  await page.fill("#login-password", credentials.password);
  await page.getByRole("button", { name: "Iniciar sesion" }).click();
}

test("redirecciona a dashboard de admin luego de login", async ({ page }) => {
  await loginAs(page, { ci: "0000", password: "admin" });
  await expect(page).toHaveURL(/\/dashboard\/admin$/);
});

test("redirecciona a dashboard de clinician luego de login", async ({
  page,
}) => {
  await loginAs(page, { ci: "1234567", password: "clinician" });
  await expect(page).toHaveURL(/\/dashboard\/clinician$/);
});

test("redirecciona a dashboard de patient luego de login", async ({ page }) => {
  await loginAs(page, { ci: "9988776", password: "patient" });
  await expect(page).toHaveURL(/\/dashboard\/patient$/);
});
