import { test, expect } from "@playwright/test";

import { admittoStub } from "./support/admittoStub";

test.describe("ticket landing page sold-out gate", () => {
    test.beforeEach(async () => {
        await admittoStub.reset();
    });

    test("shows the sold-out message when every visible ticket type is genuinely sold out", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "soldOut" },
            { id: "workshop-morning", name: "Morning Workshop", timeSlots: ["morning-workshop"], status: "soldOut" },
        ]);

        await page.goto("/tickets");

        await expect(page.getByText("All tickets are sold out.")).toBeVisible();
        await expect(page.getByLabel("Email:")).not.toBeVisible();
    });

    test("lets the attendee through when at least one ticket type is in waitlist mode, even if none are available", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "waitlist" },
            { id: "workshop-morning", name: "Morning Workshop", timeSlots: ["morning-workshop"], status: "soldOut" },
        ]);

        await page.goto("/tickets");

        await expect(page.getByText("All tickets are sold out.")).not.toBeVisible();
        await expect(page.getByLabel("Email:")).toBeVisible();
    });

    test("lets the attendee through when at least one ticket type is available (unchanged behavior)", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
        ]);

        await page.goto("/tickets");

        await expect(page.getByText("All tickets are sold out.")).not.toBeVisible();
        await expect(page.getByLabel("Email:")).toBeVisible();
    });
});
