import { test, expect } from "@playwright/test";

import { admittoStub } from "./support/admittoStub";

test.describe("registration form access", () => {
    test.beforeEach(async () => {
        // Resets to the stub's default: a single available Conference
        // ticket type, which is all the redirect scenarios below need.
        await admittoStub.reset();
    });

    test("redirects to the ticket landing page when the email is missing from the URL", async ({ page }) => {
        await page.goto("/tickets/register?token=some-token");

        await expect(page).toHaveURL(/\/tickets$/);
    });

    test("redirects to the ticket landing page when the token is missing from the URL", async ({ page }) => {
        await page.goto("/tickets/register?email=attendee%40example.com");

        await expect(page).toHaveURL(/\/tickets$/);
    });

    test("redirects to the ticket landing page silently (no query parameter or banner) when both email and token are missing", async ({ page }) => {
        await page.goto("/tickets/register");

        const url = new URL(page.url());
        expect(url.pathname).toBe("/tickets");
        expect(url.search).toBe("");
    });

    test("still lands on the invalid/expired page when the backend rejects the token during submission", async ({ page }) => {
        await admittoStub.setRegisterResponse({
            mode: "error",
            status: 401,
            code: "attendee.invalid_token",
            detail: "Verification token is invalid or expired.",
        });

        await page.goto("/tickets/register?email=attendee%40example.com&token=a-token-the-backend-will-reject");

        // Sanity check: the registration form (not the redirect from the
        // missing-token case) is the one that rendered.
        await expect(page.getByRole("heading", { name: "Main Conference" })).toBeVisible();

        await page.getByLabel("Yes, I want to attend").check();
        await page.getByLabel("First name").fill("Ada");
        await page.getByLabel("Last name").fill("Lovelace");
        await page.getByLabel("I am a").selectOption("professional");
        await page.getByLabel("Organization / Company").fill("Analytical Engines Inc.");
        await page.getByLabel("Your role or job title").fill("Engineer");

        await page.getByRole("button", { name: "Register" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/expired$/);
        await expect(page.getByRole("heading", { name: /Invalid or Expired/i })).toBeVisible();
    });
});
