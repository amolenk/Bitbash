import { test, expect } from "@playwright/test";

import { admittoStub } from "./support/admittoStub";

const REGISTER_URL = "/tickets/register?email=attendee%40example.com&token=valid-token";

async function fillPersonalDetails(page: import("@playwright/test").Page) {
    await page.getByLabel("First name").fill("Ada");
    await page.getByLabel("Last name").fill("Lovelace");
    await page.getByLabel("I am a").selectOption("professional");
    await page.getByLabel("Organization / Company").fill("Analytical Engines Inc.");
    await page.getByLabel("Your role or job title").fill("Engineer");
}

test.describe("submission outcomes clearly communicated (create flow)", () => {
    test.beforeEach(async () => {
        await admittoStub.reset();
    });

    test("a confirmed-only submission lands on a confirmation page with the neutral headline and only a confirmed itemization", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
        ]);

        await page.goto(REGISTER_URL);
        await page.getByLabel("Yes, I want to attend").check();
        await fillPersonalDetails(page);
        await page.getByRole("button", { name: "Register" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/thankyou/);
        await expect(page.getByRole("heading", { name: "Registration Received" })).toBeVisible();

        await expect(page.getByRole("heading", { name: "Confirmed" })).toBeVisible();
        await expect(page.getByText("Conference", { exact: true })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Waitlisted" })).not.toBeVisible();
    });

    test("a waitlisted-only submission lands on a confirmation page with the same neutral headline and only a waitlisted itemization", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "waitlist" },
        ]);

        await page.goto(REGISTER_URL);
        await page.getByLabel("Yes, join the waitlist").check();
        await fillPersonalDetails(page);
        await page.getByRole("button", { name: "Register" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/thankyou/);
        await expect(page.getByRole("heading", { name: "Registration Received" })).toBeVisible();

        await expect(page.getByRole("heading", { name: "Waitlisted" })).toBeVisible();
        await expect(page.getByText("Conference", { exact: true })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Confirmed" })).not.toBeVisible();
    });

    test("a mixed submission lands on a confirmation page with the same neutral headline and both itemizations correctly split", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-waitlist", name: "Waitlisted Session", timeSlots: ["afternoon-workshop"], status: "waitlist" },
        ]);

        await page.goto(REGISTER_URL);
        await page.getByLabel("Yes, I want to attend").check();
        await page.getByLabel("Waitlisted Session").check();
        await fillPersonalDetails(page);
        await page.getByRole("button", { name: "Register" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/thankyou/);
        await expect(page.getByRole("heading", { name: "Registration Received" })).toBeVisible();

        const confirmedSection = page.getByTestId("confirmed-tickets");
        await expect(confirmedSection.getByRole("heading", { name: "Confirmed" })).toBeVisible();
        await expect(confirmedSection.getByText("Conference", { exact: true })).toBeVisible();
        await expect(confirmedSection.getByText("Waitlisted Session")).not.toBeVisible();

        const waitlistedSection = page.getByTestId("waitlisted-tickets");
        await expect(waitlistedSection.getByRole("heading", { name: "Waitlisted" })).toBeVisible();
        await expect(waitlistedSection.getByText("Waitlisted Session", { exact: true })).toBeVisible();
        await expect(waitlistedSection.getByText("Conference", { exact: true })).not.toBeVisible();
    });

    test("a stale ticket-state conflict on submit clears ticket selections and shows a reselect message, while keeping personal details filled in", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-a", name: "Morning Session", timeSlots: ["morning-workshop"], status: "available" },
        ]);

        await page.goto(REGISTER_URL);
        await page.getByLabel("Yes, I want to attend").check();
        await page.getByLabel("Morning Session").check();
        await fillPersonalDetails(page);

        // Simulate availability shifting between page load and submit: the
        // backend now rejects the submission as stale, and a refetch will
        // reveal the workshop has since sold out.
        await admittoStub.setRegisterResponse({
            mode: "error",
            status: 409,
            code: "registration.ticket_state_conflict",
            detail: "The requested ticket type state no longer matches the submitted action.",
        });
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-a", name: "Morning Session", timeSlots: ["morning-workshop"], status: "soldOut" },
        ]);

        await page.getByRole("button", { name: "Register" }).click();

        // Still on the registration form -- no redirect happened.
        await expect(page).toHaveURL(/\/tickets\/register\?/);
        await expect(page.getByRole("heading", { name: "Main Conference" })).toBeVisible();

        // A message asking the attendee to review and reselect their tickets.
        await expect(page.getByText(/review.*reselect/i)).toBeVisible();

        // Ticket selections cleared back to unselected.
        await expect(page.getByLabel("Yes, I want to attend")).not.toBeChecked();
        await expect(page.getByLabel("No, I do not want to attend the main conference")).not.toBeChecked();
        await expect(page.getByLabel("Morning Session")).not.toBeChecked();

        // Fresh availability was refetched: the workshop now shows sold out.
        await expect(page.getByLabel("Morning Session")).toBeDisabled();
        const workshopRow = page.locator("label", { has: page.getByText("Morning Session") });
        await expect(workshopRow.getByText("Sold Out")).toBeVisible();

        // Personal details remain filled in.
        await expect(page.getByLabel("First name")).toHaveValue("Ada");
        await expect(page.getByLabel("Last name")).toHaveValue("Lovelace");
        await expect(page.getByLabel("Organization / Company")).toHaveValue("Analytical Engines Inc.");
        await expect(page.getByLabel("Your role or job title")).toHaveValue("Engineer");
    });
});
