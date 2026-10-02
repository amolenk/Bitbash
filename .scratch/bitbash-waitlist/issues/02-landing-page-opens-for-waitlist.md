# 02: Landing page opens when only a waitlist is available

**What to build:** An attendee arriving on the ticket landing page is let into the registration flow whenever at least one ticket type still has an open waitlist, not just when one is fully available — today the "sold out" gate treats "waitlist" and "sold out" identically and blocks the whole flow.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The ticket landing page's sold-out gate blocks entry only when every visible ticket type is genuinely sold out (no waitlist).
- [ ] The landing page lets the attendee through to begin the registration flow when at least one visible ticket type is in waitlist mode, even if none are fully available.
- [ ] The existing sold-out messaging and page behavior are unchanged for the case where every ticket type is truly sold out.
