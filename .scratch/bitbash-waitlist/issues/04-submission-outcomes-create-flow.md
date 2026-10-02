# 04: Submission outcomes clearly communicated (create flow)

**What to build:** After submitting a registration, an attendee gets a confirmation that accurately reflects what actually happened — confirmed vs. waitlisted, itemized — and if the ticketing backend rejects the submission because availability shifted mid-flow, the attendee is told to reselect rather than shown a misleading generic error.

**Blocked by:** 03 (Waitlist-aware selection UI + split submission)

**Status:** ready-for-agent

- [ ] After a successful submission, the confirmation page shows a single neutral headline regardless of outcome mix (confirmed-only, waitlisted-only, or mixed).
- [ ] The confirmation page shows an itemized list of confirmed ticket type names, and a separate itemized list of waitlisted ticket type names.
- [ ] Ticket type names needed for this itemization are passed from the client to the confirmation page via URL query parameters at the point of redirect.
- [ ] A submission rejected because ticket-type availability shifted since page load results in: fresh availability being refetched, the conference/workshop selections being cleared back to unselected, all personal detail fields remaining filled in, and a message asking the attendee to review and reselect their tickets.
