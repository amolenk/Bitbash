# 05: Edit flow gets waitlist switching

**What to build:** An attendee editing their existing registration sees the same waitlist-aware presentation as on the original registration form, can see their current queue position for anything they're waitlisted on, and can move ticket types between confirmed and waitlisted in either direction.

**Blocked by:** 03 (Waitlist-aware selection UI + split submission) in this repo, and **Admitto tickets 04 (Update-registration supports confirmed⟷waitlist switching) and 05 (Registration read model exposes waitlist state)** in the Admitto repo

**Status:** ready-for-agent

- [x] The edit-existing-registration form presents the same three-status Main Conference/Workshops treatment as the create flow (reusing the same shared components).
- [x] The edit form additionally displays, for any ticket type the attendee currently only holds a waitlist position for, that current queue position.
- [x] Submitting a change moves ticket types between confirmed and waitlisted via the update endpoint's split request shape.
- [x] An attendee holding a confirmed ticket type can select a different, currently-waitlisted ticket type instead, and successfully move themselves to that waitlist.
- [x] An attendee currently on a waitlist can select a currently-available ticket type instead, and successfully become confirmed for it.
