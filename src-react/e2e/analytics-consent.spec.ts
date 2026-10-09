import { expect, test } from "@playwright/test";

import { admittoStub } from "./support/admittoStub";

const googleTagUrl = "https://www.googletagmanager.com/gtag/js?id=G-KZWM1BBHB7";
const registerUrl = "/tickets/register?email=attendee%40example.com&token=valid-token";

test.describe("analytics consent", () => {
    test("does not load Google Analytics until accepted and lets visitors change their choice", async ({ page }) => {
        let googleTagRequests = 0;
        await page.route(googleTagUrl, async route => {
            googleTagRequests += 1;
            await route.fulfill({ status: 200, body: "" });
        });

        await page.goto("/");

        const banner = page.getByRole("dialog", { name: "Cookie preferences" });
        await expect(banner).toBeVisible();
        await expect(googleTagRequests).toBe(0);

        await banner.getByRole("button", { name: "Accept analytics" }).click();
        await expect.poll(() => googleTagRequests).toBe(1);
        await expect.poll(async () => page.context().cookies()).toContainEqual(expect.objectContaining({
            name: "bitbash-analytics-consent",
            value: "granted",
        }));

        await page.getByRole("button", { name: "Cookie preferences" }).click();
        await expect(banner).toBeVisible();
        await banner.getByRole("button", { name: "Reject analytics" }).click();
        await expect.poll(async () => page.context().cookies()).toContainEqual(expect.objectContaining({
            name: "bitbash-analytics-consent",
            value: "denied",
        }));
    });

    test("records registration completion after a successful registration", async ({ page }) => {
        await admittoStub.reset();
        await page.context().addCookies([
            {
                name: "bitbash-analytics-consent",
                value: "granted",
                domain: "127.0.0.1",
                path: "/",
            },
        ]);
        await page.route(googleTagUrl, async route => {
            await route.fulfill({ status: 200, body: "" });
        });

        await page.goto(registerUrl);
        await page.getByLabel("Yes, I want to attend").check();
        await page.getByLabel("First name").fill("Ada");
        await page.getByLabel("Last name").fill("Lovelace");
        await page.getByLabel("I am a").selectOption("professional");
        await page.getByLabel("Organization / Company").fill("Analytical Engines Inc.");
        await page.getByLabel("Your role or job title").fill("Engineer");
        await page.getByRole("button", { name: "Register" }).click();

        await expect.poll(async () => page.evaluate(() => window.dataLayer)).toContainEqual([
            "event",
            "registration_complete",
        ]);
    });

    test("does not record registration completion for a direct thank-you page visit", async ({ page }) => {
        await page.context().addCookies([
            {
                name: "bitbash-analytics-consent",
                value: "granted",
                domain: "127.0.0.1",
                path: "/",
            },
        ]);
        await page.route(googleTagUrl, async route => {
            await route.fulfill({ status: 200, body: "" });
        });

        await page.goto("/tickets/register/thankyou");
        await page.waitForTimeout(250);

        await expect(page.evaluate(() => window.dataLayer)).resolves.not.toContainEqual([
            "event",
            "registration_complete",
        ]);
    });
});
