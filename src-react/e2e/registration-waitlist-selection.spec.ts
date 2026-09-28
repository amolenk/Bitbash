import { test, expect } from "@playwright/test";

import { admittoStub } from "./support/admittoStub";
import { WAITLIST_EXPLANATION } from "../src/components/tickets/waitlistCopy";

const REGISTER_URL = "/tickets/register?email=attendee%40example.com&token=valid-token";

test.describe("waitlist-aware ticket selection and split submission", () => {
    test.beforeEach(async () => {
        await admittoStub.reset();
    });

    test("Main Conference switches into waitlist mode when its ticket type is in waitlist status", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "waitlist" },
        ]);

        await page.goto(REGISTER_URL);

        await expect(page.getByText("Waitlist Open")).toBeVisible();
        await expect(page.getByText("Sold Out")).not.toBeVisible();
        await expect(page.getByLabel("Yes, join the waitlist")).toBeVisible();
        await expect(page.getByLabel("No thanks")).toBeVisible();
        await expect(page.getByText(WAITLIST_EXPLANATION)).toBeVisible();
    });

    test("Main Conference keeps the disabled sold-out treatment unchanged when genuinely sold out", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "soldOut" },
        ]);

        await page.goto(REGISTER_URL);

        await expect(page.getByText("Sold Out")).toBeVisible();
        await expect(page.getByText("Waitlist Open")).not.toBeVisible();
        await expect(page.getByLabel("Yes, I want to attend")).not.toBeVisible();
    });

    test("workshops are split into Workshops, Workshop Waitlist, and Sold Out groups", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-available", name: "Available Session", timeSlots: ["morning-workshop"], status: "available" },
            { id: "workshop-waitlist", name: "Waitlisted Session", timeSlots: ["afternoon-workshop"], status: "waitlist" },
            { id: "workshop-soldout", name: "Full Session", timeSlots: ["morning-workshop", "afternoon-workshop"], status: "soldOut" },
        ]);

        await page.goto(REGISTER_URL);

        await expect(page.getByRole("heading", { name: "Workshops", exact: true })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Workshop Waitlist" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Sold Out", exact: true })).toBeVisible();
        await expect(page.getByText(WAITLIST_EXPLANATION)).toBeVisible();

        await expect(page.getByLabel("Available Session")).toBeEnabled();
        await expect(page.getByLabel("Waitlisted Session")).toBeEnabled();
        await expect(page.getByLabel("Full Session")).toBeDisabled();

        // The waitlisted workshop row carries its own informational badge,
        // distinct from an available or sold-out row.
        const waitlistedRow = page.locator("label", { has: page.getByText("Waitlisted Session") });
        await expect(waitlistedRow.getByText("Waitlist Open")).toBeVisible();
    });

    test("workshops within a group keep the existing sort order (full-day, then morning, then afternoon)", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "afternoon-session", name: "Afternoon Session", timeSlots: ["afternoon-workshop"], status: "available" },
            { id: "morning-session", name: "Morning Session", timeSlots: ["morning-workshop"], status: "available" },
            { id: "fullday-session", name: "Full Day Session", timeSlots: ["morning-workshop", "afternoon-workshop"], status: "available" },
        ]);

        await page.goto(REGISTER_URL);

        await expect(page.getByLabel("Full Day Session")).toBeVisible();

        const labels = await page.locator(".form-check-label").allTextContents();
        const workshopLabels = labels.filter(text =>
            text.includes("Afternoon Session") || text.includes("Morning Session") || text.includes("Full Day Session")
        );

        expect(workshopLabels[0]).toContain("Full Day Session");
        expect(workshopLabels[1]).toContain("Morning Session");
        expect(workshopLabels[2]).toContain("Afternoon Session");
    });

    test("a workshop group is only rendered when it has at least one ticket type in that status", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-available", name: "Available Session", timeSlots: ["morning-workshop"], status: "available" },
        ]);

        await page.goto(REGISTER_URL);

        await expect(page.getByRole("heading", { name: "Workshops", exact: true })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Workshop Waitlist" })).not.toBeVisible();
        await expect(page.getByRole("heading", { name: "Sold Out", exact: true })).not.toBeVisible();
    });

    test("selecting a waitlisted workshop still blocks a different overlapping-timeslot workshop from another group", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "morning-available", name: "Morning Session", timeSlots: ["morning-workshop"], status: "available" },
            { id: "fullday-waitlist", name: "Full Day Session", timeSlots: ["morning-workshop", "afternoon-workshop"], status: "waitlist" },
        ]);

        await page.goto(REGISTER_URL);

        await expect(page.getByLabel("Morning Session")).toBeEnabled();

        await page.getByLabel("Full Day Session").check();
        await expect(page.getByLabel("Morning Session")).toBeDisabled();

        await page.getByLabel("Full Day Session").uncheck();
        await expect(page.getByLabel("Morning Session")).toBeEnabled();
    });

    test("a submission mixing an available and a waitlisted ticket type sends one request with both lists populated", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-waitlist", name: "Waitlisted Session", timeSlots: ["afternoon-workshop"], status: "waitlist" },
        ]);

        await page.goto(REGISTER_URL);

        await page.getByLabel("Yes, I want to attend").check();
        await page.getByLabel("Waitlisted Session").check();
        await page.getByLabel("First name").fill("Ada");
        await page.getByLabel("Last name").fill("Lovelace");
        await page.getByLabel("I am a").selectOption("professional");
        await page.getByLabel("Organization / Company").fill("Analytical Engines Inc.");
        await page.getByLabel("Your role or job title").fill("Engineer");

        await page.getByRole("button", { name: "Register" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/thankyou/);

        expect(await admittoStub.getRegisterRequestCount()).toBe(1);

        const lastRequest = await admittoStub.getLastRegisterRequest();
        expect(lastRequest?.registerTicketTypeIds).toEqual(["conference-ticket"]);
        expect(lastRequest?.waitlistTicketTypeIds).toEqual(["workshop-waitlist"]);
    });
});
