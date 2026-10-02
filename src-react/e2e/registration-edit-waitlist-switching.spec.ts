import { test, expect } from "@playwright/test";

import { admittoStub, StubRegistration } from "./support/admittoStub";

const REGISTRATION_ID = "reg-123";
const EDIT_URL = `/tickets/edit/${REGISTRATION_ID}`;

const baseRegistration: Omit<StubRegistration, "ticketTypeIds" | "tickets" | "waitlistedTicketTypes"> = {
    id: REGISTRATION_ID,
    email: "attendee@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    status: "registered",
    additionalDetails: {
        "attendee-type": "professional",
        organization: "Analytical Engines Inc.",
        role: "Engineer"
    },
    offeredTicketTypes: []
};

test.describe("edit flow gets waitlist switching", () => {
    test.beforeEach(async () => {
        await admittoStub.reset();
    });

    test("an attendee purely on a waitlist (no confirmed ticket at all) can still reach and use the edit form", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "waitlist" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: [],
            tickets: [],
            waitlistedTicketTypes: [{ ticketTypeId: "conference-ticket", position: 3 }]
        });

        await page.goto(EDIT_URL);

        // Same waitlist-aware presentation as the create flow.
        await expect(page.getByText("Waitlist Open")).toBeVisible();
        await expect(page.getByLabel("Yes, join the waitlist")).toBeChecked();

        await expect(page.getByText(/queue position/i)).not.toBeVisible();

        // Personal details were preloaded from the registration.
        await expect(page.getByLabel("First name")).toHaveValue("Ada");
        await expect(page.getByLabel("Last name")).toHaveValue("Lovelace");
    });

    test("the edit form renders the same three-group workshop presentation without a queue position", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-available", name: "Available Session", timeSlots: ["morning-workshop"], status: "available" },
            { id: "workshop-waitlist", name: "Waitlisted Session", timeSlots: ["afternoon-workshop"], status: "waitlist" },
            { id: "workshop-soldout", name: "Full Session", timeSlots: ["morning-workshop", "afternoon-workshop"], status: "soldOut" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: [],
            tickets: [],
            waitlistedTicketTypes: [{ ticketTypeId: "workshop-waitlist", position: 5 }]
        });

        await page.goto(EDIT_URL);

        await expect(page.getByRole("heading", { name: "Workshops", exact: true })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Workshop Waitlist" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Sold Out", exact: true })).toBeVisible();

        await expect(page.getByLabel("Waitlisted Session")).toBeChecked();
        await expect(page.getByText(/queue position/i)).not.toBeVisible();
    });

    test("an attendee currently confirmed for a ticket type can switch to a different, currently-waitlisted ticket type instead", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-confirmed", name: "Morning Session A", timeSlots: ["morning-workshop"], status: "available" },
            { id: "workshop-waitlist-target", name: "Morning Session B", timeSlots: ["morning-workshop"], status: "waitlist" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: ["workshop-confirmed"],
            tickets: [{ id: "workshop-confirmed", name: "Morning Session A" }],
            waitlistedTicketTypes: []
        });

        await page.goto(EDIT_URL);

        await expect(page.getByLabel("Morning Session A")).toBeChecked();
        await expect(page.getByLabel("Morning Session B")).not.toBeChecked();

        // Same timeslot: must give up the confirmed pick before the
        // waitlisted one becomes selectable.
        await page.getByLabel("Morning Session A").uncheck();
        await page.getByLabel("Morning Session B").check();

        await page.getByRole("button", { name: "Update Registration" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/updated/);

        expect(await admittoStub.getUpdateRequestCount()).toBe(1);
        const lastRequest = await admittoStub.getLastUpdateRequest();
        expect(lastRequest?.registerTicketTypeIds).toEqual([]);
        expect(lastRequest?.waitlistTicketTypeIds).toEqual(["workshop-waitlist-target"]);

        await expect(page.getByRole("heading", { name: "Waitlisted" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Confirmed" })).not.toBeVisible();
    });

    test("an attendee currently on a waitlist can switch to a different, currently-available ticket type and become confirmed", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-available-target", name: "Afternoon Session A", timeSlots: ["afternoon-workshop"], status: "available" },
            { id: "workshop-waitlisted", name: "Afternoon Session B", timeSlots: ["afternoon-workshop"], status: "waitlist" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: [],
            tickets: [],
            waitlistedTicketTypes: [{ ticketTypeId: "workshop-waitlisted", position: 2 }]
        });

        await page.goto(EDIT_URL);

        await expect(page.getByLabel("Afternoon Session B")).toBeChecked();
        await expect(page.getByLabel("Afternoon Session A")).not.toBeChecked();

        await page.getByLabel("Afternoon Session B").uncheck();
        await page.getByLabel("Afternoon Session A").check();

        await page.getByRole("button", { name: "Update Registration" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/updated/);

        const lastRequest = await admittoStub.getLastUpdateRequest();
        expect(lastRequest?.registerTicketTypeIds).toEqual(["workshop-available-target"]);
        expect(lastRequest?.waitlistTicketTypeIds).toEqual([]);

        await expect(page.getByRole("heading", { name: "Confirmed" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Waitlisted" })).not.toBeVisible();
    });

    test("resubmitting an untouched confirmed selection keeps it confirmed even if that ticket type has since gone into waitlist mode", async ({ page }) => {
        // The attendee is already confirmed for the main conference. By the
        // time they revisit their registration, the main conference has
        // filled up and is now waitlist-only for the general public — but
        // this attendee never touches that selection, so saving an
        // unrelated change (a workshop pick) must not silently demote their
        // already-confirmed ticket into a waitlist join.
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "waitlist" },
            { id: "workshop-a", name: "Morning Session", timeSlots: ["morning-workshop"], status: "available" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: ["conference-ticket"],
            tickets: [{ id: "conference-ticket", name: "Conference" }],
            waitlistedTicketTypes: []
        });

        await page.goto(EDIT_URL);

        // The attendee still sees their own confirmed pick as "yes", not
        // suddenly reframed as a waitlist join, and only adds a workshop.
        await expect(page.getByLabel("Yes, join the waitlist")).toBeChecked();
        await page.getByLabel("Morning Session").check();

        await page.getByRole("button", { name: "Update Registration" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/updated/);

        const lastRequest = await admittoStub.getLastUpdateRequest();
        expect(lastRequest?.registerTicketTypeIds).toEqual(["conference-ticket", "workshop-a"]);
        expect(lastRequest?.waitlistTicketTypeIds).toEqual([]);
    });

    test("an attendee confirmed for a workshop that has since gone fully sold out (no waitlist) can still deselect it to switch to a different, currently-available overlapping-timeslot workshop", async ({ page }) => {
        // The attendee confirmed "Morning Session A" earlier. Other
        // attendees have since filled it completely (no waitlist left
        // either), so it now reports as soldOut. The attendee should still
        // be able to give it up in favor of a different, currently
        // available, overlapping-timeslot workshop.
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-confirmed", name: "Morning Session A", timeSlots: ["morning-workshop"], status: "soldOut" },
            { id: "workshop-available-target", name: "Morning Session B", timeSlots: ["morning-workshop"], status: "available" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: ["workshop-confirmed"],
            tickets: [{ id: "workshop-confirmed", name: "Morning Session A" }],
            waitlistedTicketTypes: []
        });

        await page.goto(EDIT_URL);

        await expect(page.getByLabel("Morning Session A")).toBeChecked();
        await expect(page.getByLabel("Morning Session A")).toBeEnabled();

        await page.getByLabel("Morning Session A").uncheck();
        await page.getByLabel("Morning Session B").check();

        await page.getByRole("button", { name: "Update Registration" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/updated/);

        const lastRequest = await admittoStub.getLastUpdateRequest();
        expect(lastRequest?.registerTicketTypeIds).toEqual(["workshop-available-target"]);
        expect(lastRequest?.waitlistTicketTypeIds).toEqual([]);
    });

    test("an attendee confirmed for a workshop that has since gone fully sold out can deselect it and then reselect it again in the same session", async ({ page }) => {
        // Regression test: unchecking an already-held sold-out workshop
        // must not permanently lock it out — it has to stay checkable so
        // the attendee can change their mind and keep their original spot.
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-confirmed", name: "Morning Session A", timeSlots: ["morning-workshop"], status: "soldOut" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: ["workshop-confirmed"],
            tickets: [{ id: "workshop-confirmed", name: "Morning Session A" }],
            waitlistedTicketTypes: []
        });

        await page.goto(EDIT_URL);

        await expect(page.getByLabel("Morning Session A")).toBeChecked();

        await page.getByLabel("Morning Session A").uncheck();
        await expect(page.getByLabel("Morning Session A")).not.toBeChecked();
        await expect(page.getByLabel("Morning Session A")).toBeEnabled();

        await page.getByLabel("Morning Session A").check();
        await expect(page.getByLabel("Morning Session A")).toBeChecked();

        // Touch an unrelated field so the otherwise fully-reverted form is
        // still considered "changed" and submittable.
        await page.getByLabel("Organization / Company").fill("Analytical Engines Inc. (updated)");

        await page.getByRole("button", { name: "Update Registration" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/updated/);

        const lastRequest = await admittoStub.getLastUpdateRequest();
        expect(lastRequest?.registerTicketTypeIds).toEqual(["workshop-confirmed"]);
        expect(lastRequest?.waitlistTicketTypeIds).toEqual([]);
    });

    test("an attendee registered for a main conference ticket that has since gone fully sold out can deselect it and then reselect it again in the same session", async ({ page }) => {
        // Regression test: the main conference section used to collapse to
        // a static sold-out message with no Yes/No controls at all once the
        // ticket type went soldOut, even for an attendee already holding
        // that ticket — so there was no way to even see, let alone toggle,
        // their own existing pick.
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "soldOut" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: ["conference-ticket"],
            tickets: [{ id: "conference-ticket", name: "Conference" }],
            waitlistedTicketTypes: []
        });

        await page.goto(EDIT_URL);

        await expect(page.getByLabel("Yes, keep my spot")).toBeChecked();

        await page.getByLabel("No, give up my spot").check();
        await expect(page.getByLabel("Yes, keep my spot")).not.toBeChecked();

        await page.getByLabel("Yes, keep my spot").check();
        await expect(page.getByLabel("Yes, keep my spot")).toBeChecked();

        // Touch an unrelated field so the otherwise fully-reverted form is
        // still considered "changed" and submittable.
        await page.getByLabel("Organization / Company").fill("Analytical Engines Inc. (updated)");

        await page.getByRole("button", { name: "Update Registration" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/updated/);

        const lastRequest = await admittoStub.getLastUpdateRequest();
        expect(lastRequest?.registerTicketTypeIds).toEqual(["conference-ticket"]);
        expect(lastRequest?.waitlistTicketTypeIds).toEqual([]);
    });

    test("a stale ticket-state conflict on update clears ticket selections and shows a reselect message, while keeping personal details filled in", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-a", name: "Morning Session", timeSlots: ["morning-workshop"], status: "available" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: ["conference-ticket"],
            tickets: [{ id: "conference-ticket", name: "Conference" }],
            waitlistedTicketTypes: []
        });

        await page.goto(EDIT_URL);
        await page.getByLabel("Morning Session").check();

        await admittoStub.setUpdateResponse({
            mode: "error",
            status: 409,
            code: "registration.ticket_state_conflict",
            detail: "The requested ticket type state no longer matches the submitted action."
        });
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-a", name: "Morning Session", timeSlots: ["morning-workshop"], status: "soldOut" }
        ]);

        await page.getByRole("button", { name: "Update Registration" }).click();

        await expect(page).toHaveURL(/\/tickets\/edit\//);
        await expect(page.getByText(/review.*reselect/i)).toBeVisible();

        await expect(page.getByLabel("Yes, I want to attend")).not.toBeChecked();
        await expect(page.getByLabel("No, I do not want to attend the main conference")).not.toBeChecked();
        await expect(page.getByLabel("Morning Session")).not.toBeChecked();
        await expect(page.getByLabel("Morning Session")).toBeDisabled();

        await expect(page.getByLabel("First name")).toHaveValue("Ada");
        await expect(page.getByLabel("Last name")).toHaveValue("Lovelace");
        await expect(page.getByLabel("Organization / Company")).toHaveValue("Analytical Engines Inc.");
    });
});
