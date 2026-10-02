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

        const confirmedCard = page.getByTestId("confirmed-tickets");
        await expect(confirmedCard.getByRole("heading", { name: "Confirmed", level: 2 })).toBeVisible();
        await expect(confirmedCard.getByText("Conference", { exact: true })).toHaveClass(/fs-5/);
        await expect(page.getByText("If you don't receive an email shortly, please check your spam folder.")).toBeVisible();
        await expect(confirmedCard.getByText("If you don't receive an email shortly, please check your spam folder.")).toHaveCount(0);
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

        const waitlistedCard = page.getByTestId("waitlisted-tickets");
        await expect(waitlistedCard.getByRole("heading", { name: "Waitlisted", level: 2 })).toBeVisible();
        await expect(waitlistedCard.getByText("Conference", { exact: true })).toHaveClass(/fs-5/);
        await expect(page.getByRole("heading", { name: "Confirmed" })).not.toBeVisible();

        // A waitlist-only registration must retain the same personal details
        // payload as a confirmed registration.
        expect(await admittoStub.getLastRegisterRequest()).toEqual({
            email: "attendee@example.com",
            firstName: "Ada",
            lastName: "Lovelace",
            registerTicketTypeIds: [],
            waitlistTicketTypeIds: ["conference-ticket"],
            couponCode: null,
            additionalDetails: {
                "attendee-type": "professional",
                organization: "Analytical Engines Inc.",
                role: "Engineer",
                "graduation-date": ""
            }
        });
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

test("the registration update confirmation uses the same outcome cards", async ({ page }) => {
    await page.goto("/tickets/register/updated?confirmed=Conference&waitlisted=Workshop%20One&ticketsChanged=true");

    const confirmedCard = page.getByTestId("confirmed-tickets");
    await expect(confirmedCard.getByRole("heading", { name: "Confirmed", level: 2 })).toBeVisible();
    await expect(confirmedCard.getByText("Conference", { exact: true })).toHaveClass(/fs-5/);

    const waitlistedCard = page.getByTestId("waitlisted-tickets");
    await expect(waitlistedCard.getByRole("heading", { name: "Waitlisted", level: 2 })).toBeVisible();
    await expect(waitlistedCard.getByText("Workshop One", { exact: true })).toHaveClass(/fs-5/);

    const spamWarning = page.getByText("If you don't receive an email shortly, please check your spam folder.");
    await expect(spamWarning).toBeVisible();
    await expect(confirmedCard.getByText("If you don't receive an email shortly, please check your spam folder.")).toHaveCount(0);
    await expect(waitlistedCard.getByText("If you don't receive an email shortly, please check your spam folder.")).toHaveCount(0);
});
