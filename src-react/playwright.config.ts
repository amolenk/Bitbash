import { defineConfig, devices } from "@playwright/test";

import { appBaseURL, APP_PORT, stubBaseURL, STUB_PORT } from "./e2e/support/env.mjs";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: "list",

    use: {
        baseURL: appBaseURL,
        trace: "retain-on-failure",
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],

    // Two real processes back every test run: the Admitto stub server (the
    // one true external dependency, stubbed at the HTTP boundary) and a real
    // production build of the Next.js site, wired to talk to the stub via
    // ADMITTO_URL. Both Next.js page/server-component logic and the internal
    // /api/tickets/* proxy routes run as real, unmodified code.
    webServer: [
        {
            command: `node e2e/support/admitto-stub-server.mjs`,
            url: stubBaseURL,
            reuseExistingServer: !process.env.CI,
            timeout: 30_000,
            env: {
                PORT: String(STUB_PORT),
            },
        },
        {
            command: `pnpm build && node server.js`,
            url: appBaseURL,
            reuseExistingServer: !process.env.CI,
            timeout: 300_000,
            env: {
                PORT: String(APP_PORT),
                ADMITTO_URL: stubBaseURL,
                ADMITTO_API_KEY: "e2e-test-api-key",
                ADMITTO_EVENT_SLUG: "bitbash-e2e",
                ADMITTO_MAIN_CONFERENCE_TICKET_TYPE_NAME: "Conference",
            },
        },
    ],
});
