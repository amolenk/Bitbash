import { test, expect } from "@playwright/test";

import { admittoStub, StubRegistration } from "./support/admittoStub";

const REGISTRATION_ID = "reg-123";
const EDIT_URL = `/tickets/edit/${REGISTRATION_ID}`;
const REGISTER_URL = "/tickets/register?email=attendee%40example.com&token=valid-token";
const COUPON_CODE = "11111111-1111-1111-1111-111111111111";

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
            waitlistedTicketTypes: []
        });
        await admittoStub.setCouponResponse({
            mode: "success",
            status: "active",
            allowedTicketTypes: [{ id: "workshop-vip", name: "VIP Session" }]
        });

        await page.goto(`${EDIT_URL}?coupon=${COUPON_CODE}`);

        await expect(page.getByRole("heading", { name: /^Coupon$/ })).not.toBeVisible();
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
            waitlistedTicketTypes: [{ ticketTypeId: "conference-ticket", position: 7 }]
        });
        await admittoStub.setCouponResponse({
            mode: "success",
            status: "active",
            allowedTicketTypes: [{ id: "conference-ticket", name: "Conference" }]
        });

        await page.goto(`${EDIT_URL}?coupon=${COUPON_CODE}`);

        await expect(page.getByRole("heading", { name: /^Coupon$/ })).not.toBeVisible();

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

    test("an outstanding waitlist offer is preselected and redeemed by its URL coupon", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "waitlist" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            status: "waitlisted",
            ticketTypeIds: [],
            tickets: [],
            waitlistedTicketTypes: [],
            offeredTicketTypes: [{ ticketTypeId: "conference-ticket", expiresAt: "2026-12-01T12:00:00Z" }]
        });
        await admittoStub.setCouponResponse({
            mode: "success",
            status: "active",
            allowedTicketTypes: [{ id: "conference-ticket", name: "Conference" }]
        });

        await page.goto(`${EDIT_URL}?coupon=${COUPON_CODE}`);

        await expect(page.getByTestId("outstanding-offer")).toContainText("Conference");
        await expect(page.getByTestId("outstanding-offer")).not.toContainText(/coupon/i);
        await expect(page.getByRole("heading", { name: /^Coupon$/ })).not.toBeVisible();
        await expect(page.getByLabel("Yes, I want to attend")).toBeChecked();
        await expect(page.getByRole("button", { name: "Update Registration" })).toBeEnabled();

        await page.getByRole("button", { name: "Update Registration" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/updated/);

        const lastRequest = await admittoStub.getLastUpdateRequest();
        expect(lastRequest?.couponCode).toBe(COUPON_CODE);
        expect(lastRequest?.registerTicketTypeIds).toEqual(["conference-ticket"]);
        expect(lastRequest?.waitlistTicketTypeIds).toEqual([]);
    });

    test("an outstanding offer does not block edits when the link has no coupon", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "waitlist" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            status: "waitlisted",
            ticketTypeIds: [],
            tickets: [],
            waitlistedTicketTypes: [],
            offeredTicketTypes: [{ ticketTypeId: "conference-ticket", expiresAt: "2026-12-01T12:00:00Z" }]
        });

        await page.goto(EDIT_URL);

        await expect(page.getByTestId("outstanding-offer")).toBeVisible();
        await page.getByLabel("First name").fill("Grace");
        await expect(page.getByRole("button", { name: "Update Registration" })).toBeEnabled();
    });

    test("an unknown coupon code does not unlock anything or show a coupon card", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-vip", name: "VIP Session", timeSlots: ["morning-workshop"], status: "soldOut" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: ["conference-ticket"],
            tickets: [{ id: "conference-ticket", name: "Conference" }],
            waitlistedTicketTypes: []
        });
        await admittoStub.setCouponResponse({
            mode: "error",
            status: 404,
            code: "coupon.not_found",
            detail: "Coupon not found."
        });

        await page.goto(`${EDIT_URL}?coupon=${COUPON_CODE}`);

        await expect(page.getByRole("heading", { name: "Coupon" })).not.toBeVisible();
        await expect(page.getByLabel("VIP Session")).toBeDisabled();
    });

    test("an already-redeemed coupon does not unlock anything or show a coupon card", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-vip", name: "VIP Session", timeSlots: ["morning-workshop"], status: "soldOut" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: ["conference-ticket"],
            tickets: [{ id: "conference-ticket", name: "Conference" }],
            waitlistedTicketTypes: []
        });
        await admittoStub.setCouponResponse({
            mode: "success",
            status: "redeemed",
            allowedTicketTypes: [{ id: "workshop-vip", name: "VIP Session" }]
        });

        await page.goto(`${EDIT_URL}?coupon=${COUPON_CODE}`);

        await expect(page.getByRole("heading", { name: "Coupon" })).not.toBeVisible();
        await expect(page.getByLabel("VIP Session")).toBeDisabled();
    });

    test("an expired coupon does not unlock anything or show a coupon card", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-vip", name: "VIP Session", timeSlots: ["morning-workshop"], status: "soldOut" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: ["conference-ticket"],
            tickets: [{ id: "conference-ticket", name: "Conference" }],
            waitlistedTicketTypes: []
        });
        await admittoStub.setCouponResponse({
            mode: "success",
            status: "expired",
            allowedTicketTypes: [{ id: "workshop-vip", name: "VIP Session" }]
        });

        await page.goto(`${EDIT_URL}?coupon=${COUPON_CODE}`);

        await expect(page.getByRole("heading", { name: "Coupon" })).not.toBeVisible();
        await expect(page.getByLabel("VIP Session")).toBeDisabled();
    });

    test("does not redeem a URL coupon when no unlocked ticket remains selected", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-vip", name: "VIP Session", timeSlots: ["morning-workshop"], status: "soldOut" }
        ]);
        await admittoStub.setRegistration({
            ...baseRegistration,
            ticketTypeIds: ["conference-ticket"],
            tickets: [{ id: "conference-ticket", name: "Conference" }],
            waitlistedTicketTypes: []
        });
        await admittoStub.setCouponResponse({
            mode: "success",
            status: "active",
            allowedTicketTypes: [{ id: "workshop-vip", name: "VIP Session" }]
        });

        await page.goto(`${EDIT_URL}?coupon=${COUPON_CODE}`);

        await expect(page.getByRole("heading", { name: "Coupon" })).not.toBeVisible();
        await expect(page.getByRole("button", { name: "Update Registration" })).toBeDisabled();

        await page.getByLabel("First name").fill("Grace");
        await page.getByRole("button", { name: "Update Registration" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/updated/);
        expect((await admittoStub.getLastUpdateRequest())?.couponCode).toBeNull();
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

        await page.goto(`${REGISTER_URL}&coupon=${COUPON_CODE}`);

        await expect(page.getByRole("heading", { name: "Coupon" })).not.toBeVisible();
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

    test("a coupon in the registration URL unlocks its ticket without a coupon card", async ({ page }) => {
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

        await expect(page.getByRole("heading", { name: "Coupon" })).not.toBeVisible();
        await expect(page.getByLabel("VIP Session")).toBeEnabled();
    });

    test("does not redeem a URL coupon when the attendee selects only regular tickets", async ({ page }) => {
        await admittoStub.setTicketTypes([
            { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
            { id: "workshop-vip", name: "VIP Session", timeSlots: ["morning-workshop"], status: "soldOut" }
        ]);
        await admittoStub.setCouponResponse({
            mode: "success",
            status: "active",
            allowedTicketTypes: [{ id: "workshop-vip", name: "VIP Session" }]
        });

        await page.goto(`${REGISTER_URL}&coupon=${COUPON_CODE}`);

        await expect(page.getByRole("heading", { name: "Coupon" })).not.toBeVisible();
        await page.getByLabel("Yes, I want to attend").check();
        await page.getByLabel("First name").fill("Ada");
        await page.getByLabel("Last name").fill("Lovelace");
        await page.getByLabel("I am a").selectOption("professional");
        await page.getByLabel("Organization / Company").fill("Analytical Engines Inc.");
        await page.getByLabel("Your role or job title").fill("Engineer");
        await page.getByRole("button", { name: "Register" }).click();

        await expect(page).toHaveURL(/\/tickets\/register\/thankyou/);
        expect((await admittoStub.getLastRegisterRequest())?.couponCode).toBeNull();
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
        await expect(page.getByRole("heading", { name: "Coupon" })).not.toBeVisible();
    });

    test("limits a closed registration flow to ticket types covered by a valid URL coupon", async ({ page }) => {
        await page.addInitScript(() => {
            const RealDate = Date;
            const ClosedRegistrationDate = new Proxy(RealDate, {
                construct(target, args) {
                    return Reflect.construct(target, args.length === 0 ? ["2027-02-01T12:00:00.000Z"] : args);
                },
                get(target, property, receiver) {
                    if (property === "now") {
                        return () => new RealDate("2027-02-01T12:00:00.000Z").getTime();
                    }
                    return Reflect.get(target, property, receiver);
                }
            });
            window.Date = ClosedRegistrationDate as unknown as DateConstructor;
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

        await expect(page.getByRole("heading", { name: "Coupon" })).not.toBeVisible();
        await expect(page.getByLabel("VIP Session")).toBeEnabled();
        await expect(page.getByLabel("General Session")).toBeDisabled();
        await expect(page.getByRole("heading", { name: /Main Conference.*Sold Out/ })).toBeVisible();
    });
});
