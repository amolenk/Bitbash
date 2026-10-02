import { test, expect } from "@playwright/test";

import { admittoStub, StubRegistration } from "./support/admittoStub";

const REGISTRATION_ID = "reg-123";
const EDIT_URL = `/tickets/edit/${REGISTRATION_ID}`;
const REGISTER_URL = "/tickets/register?email=attendee%40example.com&token=valid-token";
const COUPON_CODE = "11111111-1111-1111-1111-111111111111";

const baseRegistration: Omit<StubRegistration, "ticketTypeIds" | "tickets" | "waitlistedTickets"> = {
    id: REGISTRATION_ID,
    email: "attendee@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    status: "registered",
    additionalDetails: {
        "attendee-type": "professional",
        organization: "Analytical Engines Inc.",
        role: "Engineer"
    }
};

test.describe("coupon redemption on the edit flow", () => {
    test.beforeEach(async () => {
        await admittoStub.reset();
    });

    test("a valid coupon unlocks a sold-out workshop for this attendee, and submission redeems it as confirmed", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-vip", name: "VIP Session", timeSlots: ["morning-workshop"], status: "soldOut" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: ["conference-ticket"],
            tickets: [{ id: "conference-ticket", name: "Conference" }],
            waitlistedTickets: []
        });
        await admittoStub.setCouponResponse({
            mode: "success",
            status: "active",
            allowedTicketTypes: [{ id: "workshop-vip", name: "VIP Session" }]
        });

        await page.goto(EDIT_URL);

        // Before redeeming the coupon, the workshop is shown as sold out
        // and cannot be selected.
        await expect(page.getByRole("heading", { name: "Sold Out", exact: true })).toBeVisible();
        await expect(page.getByLabel("VIP Session")).toBeDisabled();

        await page.getByLabel("Coupon code").fill(COUPON_CODE);
        await page.getByRole("button", { name: "Apply Coupon" }).click();

        await expect(page.getByTestId("coupon-applied-message")).toContainText("VIP Session");
        await expect(page.getByText("Unlocked by Coupon")).toBeVisible();

        await expect(page.getByLabel("VIP Session")).toBeEnabled();
        await page.getByLabel("VIP Session").check();

        await page.getByRole("button", { name: "Update Registration" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/updated/);

        expect(await admittoStub.getUpdateRequestCount()).toBe(1);
        const lastRequest = await admittoStub.getLastUpdateRequest();
        expect(lastRequest?.couponCode).toBe(COUPON_CODE);
        expect(lastRequest?.registerTicketTypeIds).toEqual(["conference-ticket", "workshop-vip"]);
        expect(lastRequest?.waitlistTicketTypeIds).toEqual([]);

        await expect(page.getByRole("heading", { name: "Confirmed" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Waitlisted" })).not.toBeVisible();
    });

    test("a valid coupon unlocks a waitlisted main conference ticket for this attendee", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "waitlist" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: [],
            tickets: [],
            waitlistedTickets: [{ ticketTypeId: "conference-ticket", position: 7 }]
        });
        await admittoStub.setCouponResponse({
            mode: "success",
            status: "active",
            allowedTicketTypes: [{ id: "conference-ticket", name: "Conference" }]
        });

        await page.goto(`${EDIT_URL}?coupon=${COUPON_CODE}`);

        await expect(page.getByLabel("Yes, join the waitlist")).toBeChecked();

        await expect(page.getByTestId("coupon-applied-message")).toContainText("Conference");
        await expect(page.getByTestId("coupon-waitlist-confirmation-message")).toContainText("Conference");

        // The Main Conference card now presents as a normal available
        // ticket (no more "Waitlist Open"), with the coupon badge instead.
        await expect(page.getByLabel("Yes, I want to attend")).toBeVisible();
        await expect(page.getByText("Unlocked by Coupon")).toBeVisible();

        await page.getByRole("button", { name: "Update Registration" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/updated/);
        await expect(page).toHaveURL(/ticketsChanged=true/);

        const lastRequest = await admittoStub.getLastUpdateRequest();
        expect(lastRequest?.couponCode).toBe(COUPON_CODE);
        expect(lastRequest?.registerTicketTypeIds).toEqual(["conference-ticket"]);
        expect(lastRequest?.waitlistTicketTypeIds).toEqual([]);
    });

    test("an unknown coupon code shows an error and does not unlock anything", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-vip", name: "VIP Session", timeSlots: ["morning-workshop"], status: "soldOut" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: ["conference-ticket"],
            tickets: [{ id: "conference-ticket", name: "Conference" }],
            waitlistedTickets: []
        });
        await admittoStub.setCouponResponse({
            mode: "error",
            status: 404,
            code: "coupon.not_found",
            detail: "Coupon not found."
        });

        await page.goto(EDIT_URL);

        await page.getByLabel("Coupon code").fill(COUPON_CODE);
        await page.getByRole("button", { name: "Apply Coupon" }).click();

        await expect(page.getByTestId("coupon-error")).toContainText("couldn't find a coupon");
        await expect(page.getByLabel("VIP Session")).toBeDisabled();
    });

    test("an already-redeemed coupon shows an error and does not unlock anything", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-vip", name: "VIP Session", timeSlots: ["morning-workshop"], status: "soldOut" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: ["conference-ticket"],
            tickets: [{ id: "conference-ticket", name: "Conference" }],
            waitlistedTickets: []
        });
        await admittoStub.setCouponResponse({
            mode: "success",
            status: "redeemed",
            allowedTicketTypes: [{ id: "workshop-vip", name: "VIP Session" }]
        });

        await page.goto(EDIT_URL);

        await page.getByLabel("Coupon code").fill(COUPON_CODE);
        await page.getByRole("button", { name: "Apply Coupon" }).click();

        await expect(page.getByTestId("coupon-error")).toContainText("already been used");
        await expect(page.getByLabel("VIP Session")).toBeDisabled();
    });
});

test.describe("coupon redemption on the registration flow", () => {
    test.beforeEach(async () => {
        await admittoStub.reset();
    });

    test("a valid coupon unlocks a sold-out workshop and submits it as confirmed", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "soldOut" },
            { id: "workshop-vip", name: "VIP Session", timeSlots: ["morning-workshop"], status: "soldOut" }
        ]);
        await admittoStub.setCouponResponse({
            mode: "success",
            status: "active",
            allowedTicketTypes: [{ id: "workshop-vip", name: "VIP Session" }]
        });

        await page.goto(REGISTER_URL);

        await expect(page.getByLabel("VIP Session")).toBeDisabled();

        await page.getByLabel("Coupon code").fill(COUPON_CODE);
        await page.getByRole("button", { name: "Apply Coupon" }).click();

        await expect(page.getByTestId("coupon-applied-message")).toContainText("VIP Session");
        await expect(page.getByText("Unlocked by Coupon")).toBeVisible();

        await page.getByLabel("VIP Session").check();
        await page.getByLabel("First name").fill("Ada");
        await page.getByLabel("Last name").fill("Lovelace");
        await page.getByLabel("I am a").selectOption("professional");
        await page.getByLabel("Organization / Company").fill("Analytical Engines Inc.");
        await page.getByLabel("Your role or job title").fill("Engineer");
        await page.getByRole("button", { name: "Register" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/thankyou/);

        expect(await admittoStub.getRegisterRequestCount()).toBe(1);
        const lastRequest = await admittoStub.getLastRegisterRequest();
        expect(lastRequest?.couponCode).toBe(COUPON_CODE);
        expect(lastRequest?.registerTicketTypeIds).toEqual(["workshop-vip"]);
        expect(lastRequest?.waitlistTicketTypeIds).toEqual([]);

        await expect(page.getByRole("heading", { name: "Confirmed" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Waitlisted" })).not.toBeVisible();
    });

    test("a coupon in the registration URL is applied automatically", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "soldOut" },
            { id: "workshop-vip", name: "VIP Session", timeSlots: ["morning-workshop"], status: "soldOut" }
        ]);
        await admittoStub.setCouponResponse({
            mode: "success",
            status: "active",
            allowedTicketTypes: [{ id: "workshop-vip", name: "VIP Session" }]
        });

        await page.goto(`${REGISTER_URL}&coupon=${COUPON_CODE}`);

        await expect(page.getByLabel("Coupon code")).toHaveValue(COUPON_CODE);
        await expect(page.getByTestId("coupon-applied-message")).toContainText("VIP Session");
        await expect(page.getByLabel("VIP Session")).toBeEnabled();
    });

    test("preserves a coupon through the email OTP flow", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "soldOut" },
            { id: "workshop-vip", name: "VIP Session", timeSlots: ["morning-workshop"], status: "soldOut" }
        ]);
        await admittoStub.setCouponResponse({
            mode: "success",
            status: "active",
            allowedTicketTypes: [{ id: "workshop-vip", name: "VIP Session" }]
        });

        await page.goto(`/tickets?coupon=${COUPON_CODE}`);
        await page.getByLabel("Email:").fill("attendee@example.com");
        await page.getByRole("button", { name: "Start registration" }).click();

        await expect(page).toHaveURL(new RegExp(`/tickets/register/verify\\?email=attendee%40example.com&coupon=${COUPON_CODE}`));

        await page.getByLabel("OTP code").fill("123456");
        await page.getByRole("button", { name: "Verify email" }).click();

        await expect(page).toHaveURL(new RegExp(`/tickets/register\\?token=otp-token&email=attendee%40example.com&coupon=${COUPON_CODE}`));
        await expect(page.getByTestId("coupon-applied-message")).toContainText("VIP Session");
    });

    test("limits a closed registration flow to ticket types covered by a valid URL coupon", async ({ page }) => {
        await page.addInitScript(() => {
            const RealDate = Date;
            class ClosedRegistrationDate extends RealDate {
                constructor(...args: ConstructorParameters<DateConstructor>) {
                    super(...(args.length === 0 ? ["2027-02-01T12:00:00.000Z"] : args));
                }

                static now() {
                    return new RealDate("2027-02-01T12:00:00.000Z").getTime();
                }
            }
            window.Date = ClosedRegistrationDate as DateConstructor;
        });
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-general", name: "General Session", timeSlots: ["afternoon-workshop"], status: "available" },
            { id: "workshop-vip", name: "VIP Session", timeSlots: ["morning-workshop"], status: "soldOut" }
        ]);
        await admittoStub.setCouponResponse({
            mode: "success",
            status: "active",
            allowedTicketTypes: [{ id: "workshop-vip", name: "VIP Session" }]
        });

        await page.goto(`${REGISTER_URL}&coupon=${COUPON_CODE}`);

        await expect(page.getByTestId("coupon-applied-message")).toContainText("VIP Session");
        await expect(page.getByLabel("VIP Session")).toBeEnabled();
        await expect(page.getByLabel("General Session")).toBeDisabled();
        await expect(page.getByRole("heading", { name: /Main Conference.*Sold Out/ })).toBeVisible();
    });
});
