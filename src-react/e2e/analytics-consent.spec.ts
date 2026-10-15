import { expect, test } from "@playwright/test";

import { admittoStub } from "./support/admittoStub";
import { websiteSettings } from "../src/config/website-settings";

const analyticsSettings = websiteSettings.analytics;
const googleTagUrl = `https://www.googletagmanager.com/gtag/js?id=${analyticsSettings.measurementId}`;
const registerUrl = "/tickets/register?email=attendee%40example.com&token=valid-token";

test.describe("analytics consent", () => {
    test("does not load Google Analytics until accepted and lets visitors change their choice", async ({ page }) => {
        await page.context().addCookies([
            {
                name: "_ga",
                value: "existing-analytics-cookie",
                domain: "127.0.0.1",
                path: "/",
            },
        ]);
        let googleTagRequests = 0;
        await page.route(googleTagUrl, async route => {
            googleTagRequests += 1;
            await route.fulfill({ status: 200, body: "" });
        });

        await page.goto("/");

        const banner = page.getByRole("dialog", { name: "Cookie preferences" });
        await expect(banner).toBeVisible();
        await expect(googleTagRequests).toBe(0);

        await banner.getByRole("button", { name: "Accept" }).click();
        await expect.poll(() => googleTagRequests).toBe(1);
        await expect.poll(async () => page.context().cookies()).toContainEqual(expect.objectContaining({
            name: analyticsSettings.consentCookieName,
            value: "granted",
        }));

        await page.getByRole("button", { name: "Cookie preferences" }).click();
        await expect(banner).toBeVisible();
        await banner.getByRole("button", { name: "Reject" }).click();
        await expect.poll(async () => page.context().cookies()).toContainEqual(expect.objectContaining({
            name: analyticsSettings.consentCookieName,
            value: "denied",
        }));
        await expect.poll(async () => page.context().cookies()).not.toContainEqual(expect.objectContaining({
            name: "_ga",
        }));
    });

    test("records registration completion after a successful registration", async ({ page }) => {
        await admittoStub.reset();
        await page.context().addCookies([
            {
                name: analyticsSettings.consentCookieName,
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

        await expect.poll(async () => page.evaluate(() => window.dataLayer?.some(event =>
            event[0] === "event" && event[1] === "registration_complete",
        ) ?? false)).toBe(true);

        // gtag.js ignores dataLayer entries that are not `arguments` objects.
        await expect(page.evaluate(() => window.dataLayer?.every(event =>
            Object.prototype.toString.call(event) === "[object Arguments]",
        ) ?? false)).resolves.toBe(true);
    });

    test("does not record registration completion for a direct thank-you page visit", async ({ page }) => {
        await page.context().addCookies([
            {
                name: analyticsSettings.consentCookieName,
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

        await expect(page.evaluate(() => window.dataLayer?.some(event =>
            event[0] === "event" && event[1] === "registration_complete",
        ) ?? false)).resolves.toBe(false);
    });
});
