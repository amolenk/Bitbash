# Bitbash — Registration Redirect & Waitlist Support

> Companion spec: `ADMITTO_SPEC.md` (in the Admitto repo). This spec depends on the Admitto changes described there — specifically the update-registration split request shape and the registration read-model extension — being implemented first.

## Problem Statement

Two related problems on the ticket registration flow:

1. Attendees who land on the registration form page without a valid email-verification token (e.g. a stale bookmark, browser back button, or a manually edited URL) currently see the registration form itself attempt to render, instead of being sent back to the start of the registration process where they can properly verify their email and get a fresh token.
2. When a ticket type sells out, attendees have no way to express interest in getting a ticket if one becomes available later. Every full ticket type looks identical to a permanently sold-out one, and once every ticket type is full, attendees are turned away from the site entirely with no path forward — even though the underlying ticketing system already tracks a distinct "waitlist" state for tickets that are full but still accepting waitlist joins.

## Solution

1. The registration form page checks for a valid email/token pair before rendering anything; if either is missing, the attendee is sent straight back to the start of the registration flow (the ticket landing page), silently, since as far as they're concerned they're simply starting fresh.
2. Ticket types that are in "waitlist" mode (full, but still accepting waitlist joins) are shown as an actionable, joinable option distinct from tickets that are genuinely sold out with no further recourse. Attendees can join the waitlist for one or more ticket types in the same registration where they also confirm any tickets that are still available, and can later return to their existing registration (via the same edit link used for name/detail changes) to move between confirmed and waitlisted tickets as their needs change.

## User Stories

1. As an attendee who navigates directly to the registration form URL without ever verifying my email, I want to be redirected straight to the ticket landing page, so that I can start the registration process properly instead of seeing a broken or empty form.
2. As an attendee whose verification link has genuinely expired or been rejected during submission, I want to see the existing "invalid or expired" page (not be silently redirected), so that I understand what went wrong and can request a new link.
3. As an attendee landing on the ticket page when every ticket type is completely sold out with no waitlist available anywhere, I want to see the "sold out" message, so that I don't waste time verifying my email for nothing.
4. As an attendee landing on the ticket page when at least one ticket type still has a waitlist open, I want to be let into the registration flow, so that I can join that waitlist.
5. As an attendee viewing the Main Conference ticket when it's in waitlist mode, I want to see it presented as "join the waitlist" rather than "sold out", so that I understand I can still express interest.
6. As an attendee viewing the Main Conference ticket when it's genuinely sold out (no waitlist), I want to see the existing "sold out" treatment, so that I don't get my hopes up for a waitlist that doesn't exist.
7. As an attendee viewing the workshops list, I want available workshops, waitlisted workshops, and sold-out workshops shown in clearly separate, labeled groups, so that I immediately understand which of my choices are guaranteed and which are conditional.
8. As an attendee choosing between two overlapping-timeslot workshops where one is available and one is waitlisted, I want to only be able to pick one of them, so that I don't end up double-booked if both come through.
9. As an attendee submitting a registration with a mix of available and waitlisted ticket type selections, I want a single submission to handle both, so that I don't have to fill out the form twice.
10. As an attendee who has just submitted a registration that includes only confirmed tickets, I want a confirmation page that clearly states I'm registered, so that I know my ticket is guaranteed.
11. As an attendee who has just submitted a registration that includes only waitlisted tickets, I want a confirmation page that clearly states I've been added to a waitlist (not that I have a ticket), so that I don't mistakenly believe I'm confirmed to attend.
12. As an attendee who has just submitted a registration with a mix of confirmed and waitlisted tickets, I want the confirmation page to clearly itemize which is which, so that I know exactly what I do and don't have yet.
13. As an attendee whose desired ticket type's availability changed between when I loaded the page and when I submitted, I want to be told my selection needs to be redone (not a generic "please try again" that implies nothing changed), so that I understand why my original choice didn't go through.
14. As an attendee in that same situation, I want my personal details preserved and only my ticket selections cleared, so that I don't have to re-type my name and other details.
15. As an attendee editing my existing registration, I want to see the exact same available/waitlist/sold-out ticket presentation as on the original registration form, so that the experience is consistent.
16. As an attendee currently confirmed for a ticket type, I want to be able to voluntarily move myself onto the waitlist for a different (currently full) ticket type instead, so that I have the flexibility to change my mind about which session I attend.
17. As an attendee currently on a waitlist for a ticket type, I want to be able to switch to a different ticket type selection instead (whether confirmed or another waitlist), so that I'm not locked into my very first choice.
18. As an attendee currently on a waitlist, I want to see my current queue position when I view my registration, so that I have a sense of how likely I am to get in.
19. As an attendee who is purely on a waitlist (holding no confirmed ticket at all), I want to still be able to access an edit link for my registration (the same way a fully confirmed attendee can), so that I'm not left with no way to manage or cancel my own waitlist entry.
20. As an attendee who re-verifies my email after previously only joining a waitlist, I want to be routed to my existing registration (not accidentally invited to register a second time), so that the system doesn't create a duplicate signup for me.

## Implementation Decisions

**Redirect behavior**
- The registration form route becomes responsible for checking the presence of the email and verification token before any client-side rendering occurs. If either is absent, the attendee is redirected, server-side, straight to the ticket landing page — silently, with no query parameter or banner message.
- This changes the destination only for the "missing token" case. The existing "token present but rejected by the ticketing backend as invalid or expired" case (detected during submission) continues to redirect to the existing invalid/expired interstitial page, unchanged.
- The now-redundant client-side missing-token check inside the registration form component is removed.

**Ticket landing page gate**
- The landing page's "completely sold out" gate changes from "at least one ticket type must be available" to "at least one ticket type must be available OR in waitlist mode." The gate only blocks entry when every visible ticket type is genuinely sold out with no waitlist.

**Waitlist presentation — Main Conference**
- When the Main Conference ticket type's status is "waitlist" (not sold out, not available), its card switches into a distinct waitlist mode: a "Waitlist Open" badge instead of "Sold Out", explanatory copy, and the yes/no choice relabeled to "Yes, join the waitlist" / "No thanks."
- Genuinely sold-out (no waitlist) status keeps today's disabled "Sold Out" treatment unchanged.

**Waitlist presentation — Workshops**
- The single workshop list is split into three labeled groups, each rendered only when it has at least one ticket type in that status: "Workshops" (available), "Workshop Waitlist" (waitlist status, selectable, informational badge), and "Sold Out" (disabled, red badge, unchanged from today).
- Existing sort order (morning, then afternoon, then full-day) applies within each group independently.
- Same-timeslot mutual exclusivity applies uniformly across all three groups — a waitlisted selection blocks other overlapping-timeslot selections exactly like a confirmed one does.

**Shared explanatory copy**
- Both the Main Conference waitlist mode and the Workshop Waitlist section use: "This is currently full, but you can join the waitlist. If a spot opens up, we'll email you — joining the waitlist does not guarantee a ticket."

**Submission mechanics**
- On submit, the attendee's selected ticket type IDs are split into two lists based on each selected ticket type's current status at submission time: the confirmed-registration list and the waitlist-join list. Both lists are sent in the same single registration/update request.
- A single submission may legitimately contain both confirmed and waitlisted ticket types.

**Confirmation content**
- The post-registration confirmation page uses a single neutral headline ("Registration Received") regardless of whether the outcome is fully confirmed, fully waitlisted, or mixed, followed by itemized lists: confirmed ticket type names, and separately, waitlisted ticket type names. Ticket type names are passed from the client (where the split selection is already known at submit time) to the confirmation page via URL query parameters — no new lookup is needed.
- The same "confirmed vs waitlisted" itemization applies to the update-registration confirmation page.

**Conflict handling (ticket availability changed mid-submission)**
- When the ticketing backend reports that the requested ticket-state classification no longer matches reality (a ticket type's status shifted between page load and submit), the client: refetches fresh availability, clears the conference/workshop selections back to unselected (keeping all personal details filled in), and displays a message asking the attendee to review and reselect their tickets.

**Edit-flow parity**
- The edit-existing-registration form is extended with the exact same waitlist presentation, submission-splitting, and conflict-handling behavior as the fresh-registration form (both consume the same shared ticket-selection components).
- The edit form also displays, for any ticket type the attendee currently holds only a waitlist position for, that current queue position.
- This is what enables the "switch between confirmed and waitlisted" user stories: an attendee edits their registration, changes which ticket types are selected as confirmed vs. waitlist, and resubmits through the same update path.

**Dependency on the ticketing backend**
- This spec assumes the companion Admitto backend changes are already deployed: specifically, that the update-registration endpoint accepts a split confirmed/waitlist ticket-type-id request shape (mirroring the existing create-registration shape), that fetching a registration's details returns which of its ticket types are currently waitlisted (with queue position), and that every waitlist join — including a waitlist-only signup with no confirmed tickets at all — results in a registration record the attendee can look up and edit later.

## Testing Decisions

- This codebase currently has no automated test suite of any kind (no test runner, framework, or configuration present). A new, single seam is proposed: browser-driven end-to-end tests (Playwright, consistent with the tooling already used elsewhere in this developer's other projects) run against a real build of the site, with the one true external dependency — the Admitto ticketing backend — stubbed at the HTTP boundary. Everything else (both Next.js page/server-component logic and the internal API proxy routes) runs as real, unmodified code.
- This is deliberately the *highest* available seam: a test drives the browser exactly as an attendee would (load a URL, fill in a form, click submit) and asserts on what's rendered or where the browser ends up, rather than reaching into component internals or mocking internal modules.
- Suggested coverage at this seam:
  - Landing on the registration form URL without a token/email redirects to the ticket landing page.
  - Landing on the registration form URL with a token that the stubbed backend rejects still lands on the existing invalid/expired page.
  - The ticket landing page shows the sold-out message only when the stub reports every ticket type as sold out; it lets the attendee through when the stub reports at least one ticket type as waitlist-only.
  - A registration submission mixing an available ticket type and a waitlist ticket type produces one request to the backend with both lists populated, and lands on the confirmation page with both sections itemized correctly.
  - A stubbed conflict response on submit results in the ticket selections being cleared while personal details remain filled in.
  - The edit-registration page renders the same three-group waitlist presentation and allows toggling a currently-waitlisted selection to a currently-available one (and vice versa) before resubmitting.
- No existing tests exist to serve as prior art in this repo; the Playwright configuration approach used in this developer's other repositories should be used as a starting template for tooling setup, not for specific test content.

## Out of Scope

- The standalone, email-only "join/leave waitlist without a full registration" capability is explicitly not used by this frontend (it is being removed from the backend entirely — see `ADMITTO_SPEC.md`).
- Any changes to visual design system, styling, or branding beyond what's needed to add the new badges/sections/copy described above.
- Handling of the "your waitlist offer has expired" or "you've been promoted off the waitlist" notification emails — those are sent directly by the backend to the attendee's inbox and require no frontend surface.
- A manual/VIP "give this waitlisted person priority" capability — this is an admin-only capability, entirely on the Admitto admin UI, not on this site.

## Further Notes

- The frontend split of ticket-type IDs into "confirmed" vs "waitlist" buckets at submit time is a pure client-side classification based on the ticket type's status *as last fetched*; the backend remains the source of truth and will reject (with a conflict) any request whose classification no longer matches reality by the time it's processed.
- Because a waitlist-only registration will now always produce an editable registration record on the backend, the OTP-verification "do I already have a registration" lookup will naturally start finding these attendees and routing them to the edit page instead of letting them register a second time — this is an existing code path that requires no frontend change to benefit from the backend change.
