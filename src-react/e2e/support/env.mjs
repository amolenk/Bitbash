// Single source of truth for the ports/base URLs used to wire the Playwright
// webServer processes together. Both playwright.config.ts (which decides
// what to start, on which ports) and the test-side stub client (which needs
// to reach the already-running stub) import from here, so an override via
// E2E_APP_PORT / E2E_STUB_PORT can't drift between the two.

export const APP_PORT = Number(process.env.E2E_APP_PORT || 4300);
export const STUB_PORT = Number(process.env.E2E_STUB_PORT || 4310);

export const appBaseURL = `http://127.0.0.1:${APP_PORT}`;
export const stubBaseURL = `http://127.0.0.1:${STUB_PORT}`;
