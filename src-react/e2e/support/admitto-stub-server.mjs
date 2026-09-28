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
};

function resetState() {
    state = {
        ticketTypes: defaultTicketTypes,
        registerResponse: { mode: "success" },
        lastRegisterRequest: null,
        registerRequestCount: 0,
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

        sendJson(res, 404, { detail: `No stub handler for ${req.method} ${url.pathname}` });
    } catch (err) {
        sendJson(res, 500, { detail: err instanceof Error ? err.message : "Stub server error." });
    }
});

server.listen(port, "127.0.0.1", () => {
    console.log(`> Admitto stub server listening on http://127.0.0.1:${port}`);
});
