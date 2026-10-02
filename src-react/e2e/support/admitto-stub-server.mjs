// A minimal in-memory stand-in for the Admitto ticketing backend, used only
// by the Playwright e2e suite. It implements just enough of the real
// Admitto HTTP surface for the flows under test, plus a small set of
// test-only "__control__" endpoints that let a test configure how the next
// request(s) should behave before driving the browser.
//
// This is the one true external dependency stubbed at the HTTP boundary —
// everything else (Next.js pages, server components, and the internal
// /api/tickets/* proxy routes) runs as real, unmodified code against this
// server.

import { createServer } from "node:http";

const port = Number(process.env.PORT || 4310);

const defaultTicketTypes = [
    { id: "conference-ticket", name: "Conference", timeSlots: [], status: "available" },
];

let state = {
    ticketTypes: defaultTicketTypes,
    // Controls the response to the next POST /registrations call(s).
    // "success" (default) returns 204. Anything else returns an error
    // problem-details body with the given status/code/detail.
    registerResponse: { mode: "success" },
    // The most recent POST /registrations request body, so a test can
    // assert on exactly what the app sent (e.g. the confirmed vs. waitlist
    // ticket-type-id split) without reaching into app internals.
    lastRegisterRequest: null,
    // How many POST /registrations calls have been received since the last
    // reset, so a test can assert a mixed confirmed/waitlist submission
    // produced exactly one request rather than two separate ones.
    registerRequestCount: 0,
    // The registration returned by GET /registrations/:id for the edit flow.
    // null means "not found" (404), mirroring a stale/unknown edit link.
    registration: null,
    // Controls the response to the next PUT /registrations/:id call(s).
    updateResponse: { mode: "success" },
    // The most recent PUT /registrations/:id request body.
    lastUpdateRequest: null,
    // How many PUT /registrations/:id calls have been received since the
    // last reset.
    updateRequestCount: 0,
    // Controls the response to the next GET /coupons/:code call(s).
    // "success" (default) returns a coupon with the given status/allowed
    // ticket types/expiry. Anything else returns an error problem-details
    // body with the given status/code/detail (e.g. a not-found coupon).
    couponResponse: { mode: "success", status: "active", allowedTicketTypes: [], expiresAt: null },
};

function resetState() {
    state = {
        ticketTypes: defaultTicketTypes,
        registerResponse: { mode: "success" },
        lastRegisterRequest: null,
        registerRequestCount: 0,
        registration: null,
        updateResponse: { mode: "success" },
        lastUpdateRequest: null,
        updateRequestCount: 0,
        couponResponse: { mode: "success", status: "active", allowedTicketTypes: [], expiresAt: null },
    };
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let raw = "";
        req.on("data", (chunk) => { raw += chunk; });
        req.on("end", () => {
            if (!raw) return resolve(undefined);
            try {
                resolve(JSON.parse(raw));
            } catch (err) {
                reject(err);
            }
        });
        req.on("error", reject);
    });
}

function sendJson(res, status, body) {
    const payload = body === undefined ? "" : JSON.stringify(body);
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(payload);
}

const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);

    try {
        // Health check used by Playwright's webServer readiness probe.
        if (url.pathname === "/" && req.method === "GET") {
            return sendJson(res, 200, { status: "ok" });
        }

        // Test-only control endpoints.
        if (url.pathname === "/__control__/reset" && req.method === "POST") {
            resetState();
            return sendJson(res, 204, undefined);
        }

        if (url.pathname === "/__control__/ticket-types" && req.method === "PUT") {
            const body = await readJsonBody(req);
            state.ticketTypes = Array.isArray(body) ? body : defaultTicketTypes;
            return sendJson(res, 204, undefined);
        }

        if (url.pathname === "/__control__/register-response" && req.method === "PUT") {
            const body = await readJsonBody(req);
            state.registerResponse = body || { mode: "success" };
            return sendJson(res, 204, undefined);
        }

        if (url.pathname === "/__control__/last-register-request" && req.method === "GET") {
            return sendJson(res, 200, state.lastRegisterRequest);
        }

        if (url.pathname === "/__control__/register-request-count" && req.method === "GET") {
            return sendJson(res, 200, { count: state.registerRequestCount });
        }

        if (url.pathname === "/__control__/registration" && req.method === "PUT") {
            const body = await readJsonBody(req);
            state.registration = body || null;
            return sendJson(res, 204, undefined);
        }

        if (url.pathname === "/__control__/update-response" && req.method === "PUT") {
            const body = await readJsonBody(req);
            state.updateResponse = body || { mode: "success" };
            return sendJson(res, 204, undefined);
        }

        if (url.pathname === "/__control__/last-update-request" && req.method === "GET") {
            return sendJson(res, 200, state.lastUpdateRequest);
        }

        if (url.pathname === "/__control__/update-request-count" && req.method === "GET") {
            return sendJson(res, 200, { count: state.updateRequestCount });
        }

        if (url.pathname === "/__control__/coupon-response" && req.method === "PUT") {
            const body = await readJsonBody(req);
            state.couponResponse = body || { mode: "success", status: "active", allowedTicketTypes: [], expiresAt: null };
            return sendJson(res, 204, undefined);
        }

        const otpRequestMatch = url.pathname.match(/^\/api\/events\/[^/]+\/otp\/request$/);
        if (otpRequestMatch && req.method === "POST") {
            return sendJson(res, 204, undefined);
        }

        const otpVerifyMatch = url.pathname.match(/^\/api\/events\/[^/]+\/otp\/verify$/);
        if (otpVerifyMatch && req.method === "POST") {
            return sendJson(res, 200, { token: "otp-token" });
        }

        // Real Admitto-shaped endpoints, e.g. /api/events/:slug/ticket-types
        const ticketTypesMatch = url.pathname.match(/^\/api\/events\/[^/]+\/ticket-types$/);
        if (ticketTypesMatch && req.method === "GET") {
            return sendJson(res, 200, state.ticketTypes);
        }

        const registrationsMatch = url.pathname.match(/^\/api\/events\/[^/]+\/registrations$/);
        if (registrationsMatch && req.method === "POST") {
            state.lastRegisterRequest = await readJsonBody(req);
            state.registerRequestCount += 1;
            const outcome = state.registerResponse;
            if (outcome.mode === "success") {
                return sendJson(res, 204, undefined);
            }
            return sendJson(res, outcome.status || 400, {
                detail: outcome.detail || "Request rejected.",
                code: outcome.code,
            });
        }

        // Self-service registration read/update, e.g.
        // /api/events/:slug/registrations/:registrationId
        const registrationMatch = url.pathname.match(/^\/api\/events\/[^/]+\/registrations\/([^/]+)$/);
        if (registrationMatch && req.method === "GET") {
            if (!state.registration) {
                return sendJson(res, 404, { detail: "Registration not found." });
            }
            return sendJson(res, 200, state.registration);
        }

        if (registrationMatch && req.method === "PUT") {
            state.lastUpdateRequest = await readJsonBody(req);
            state.updateRequestCount += 1;
            const outcome = state.updateResponse;
            if (outcome.mode === "success") {
                return sendJson(res, 204, undefined);
            }
            return sendJson(res, outcome.status || 400, {
                detail: outcome.detail || "Request rejected.",
                code: outcome.code,
            });
        }

        // Public coupon lookup, e.g. /api/events/:slug/coupons/:couponCode
        const couponMatch = url.pathname.match(/^\/api\/events\/[^/]+\/coupons\/([^/]+)$/);
        if (couponMatch && req.method === "GET") {
            const outcome = state.couponResponse;
            if (outcome.mode === "success") {
                return sendJson(res, 200, {
                    status: outcome.status,
                    allowedTicketTypes: outcome.allowedTicketTypes,
                    expiresAt: outcome.expiresAt ?? null,
                });
            }
            return sendJson(res, outcome.status || 400, {
                detail: outcome.detail || "Request rejected.",
                code: outcome.code,
            });
        }

        sendJson(res, 404, { detail: `No stub handler for ${req.method} ${url.pathname}` });
    } catch (err) {
        sendJson(res, 500, { detail: err instanceof Error ? err.message : "Stub server error." });
    }
});

server.listen(port, "127.0.0.1", () => {
    console.log(`> Admitto stub server listening on http://127.0.0.1:${port}`);
});
