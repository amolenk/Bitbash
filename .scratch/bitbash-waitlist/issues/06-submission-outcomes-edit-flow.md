# 06: Submission outcomes clearly communicated (edit flow)

**What to build:** The same accurate, itemized confirmed/waitlisted outcome messaging and conflict-recovery behavior established for the create flow is applied to the edit-registration flow, so switching tickets while editing is just as clear as registering fresh.

**Blocked by:** 05 (Edit flow gets waitlist switching), 04 (Submission outcomes clearly communicated — create flow)

**Status:** ready-for-agent

- [x] After a successful update submission, the confirmation page shows the same itemized confirmed/waitlisted breakdown pattern established for the create flow.
- [x] An update submission rejected due to a stale ticket-state conflict results in the same refetch-and-reselect behavior established for the create flow, applied to the edit form's selections.
