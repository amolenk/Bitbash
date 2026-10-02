# 01: Redirect to start of flow on missing token

**What to build:** An attendee who lands on the registration form page without a valid email/token pair — a stale bookmark, browser back button, or a manually edited URL — is sent straight back to the start of the registration process instead of seeing a broken or empty form.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Landing on the registration form page with no email or no token present in the query string redirects, server-side, before any client rendering, to the ticket landing page.
- [ ] The redirect is silent: no query parameter or banner message is added.
- [ ] Landing on the registration form page with a token that the backend subsequently rejects as invalid or expired during submission continues to redirect to the existing invalid/expired page, unchanged.
- [ ] The now-redundant client-side missing-token check inside the registration form component is removed.
