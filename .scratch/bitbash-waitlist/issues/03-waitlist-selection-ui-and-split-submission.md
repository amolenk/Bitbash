# 03: Waitlist-aware selection UI + split submission (create flow)

**What to build:** An attendee filling out the registration form can see, understand, and choose to join a waitlist for a ticket type that's full but still accepting waitlist joins — clearly distinguished from a ticket type that's genuinely sold out — for both the Main Conference choice and the Workshops list, and submit a single registration that mixes confirmed and waitlisted selections.

**Blocked by:** None (can start immediately — the create endpoint already accepts a separate waitlist ticket-type list today)

**Status:** ready-for-agent

- [x] The Main Conference selection switches into a distinct waitlist mode (waitlist badge instead of sold-out badge, explanatory copy, choice relabeled to reflect joining a waitlist) when its ticket type's status is waitlist.
- [x] The Main Conference selection keeps today's disabled sold-out treatment unchanged when its ticket type's status is genuinely sold out.
- [x] The Workshops list is presented as three separate, labeled groups — available, waitlist, sold out — each shown only when it has at least one ticket type in that status.
- [x] Existing sort order (morning, afternoon, full-day) is preserved within each group.
- [x] Selecting a waitlist-status workshop still prevents selecting a different, overlapping-timeslot workshop from any of the three groups.
- [x] Both the Main Conference waitlist mode and the Workshop Waitlist section use the agreed explanatory copy: "This is currently full, but you can join the waitlist. If a spot opens up, we'll email you — joining the waitlist does not guarantee a ticket."
- [x] On submit, the selected ticket-type ids are split into a confirmed list and a waitlist list based on each selected ticket type's current status, and both lists are sent in the single registration request.
- [x] A submission containing both confirmed and waitlisted ticket types succeeds in one request.
