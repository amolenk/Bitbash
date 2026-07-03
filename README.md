# Bitbash
Website for the Bitbash conference

## Admitto configuration

The website integrates with the Admitto Partner API from server-side Next.js routes. Configure these variables on the server only:

| Variable | Required | Description |
|---|---|---|
| `ADMITTO_API_KEY` | Yes | Partner API key sent as `X-Api-Key`. |
| `ADMITTO_URL` | No | Admitto base URL. Defaults to `https://admitto.sandermolenkamp.com`. |
| `ADMITTO_EVENT_SLUG` | No | Admitto event slug. Defaults to `bitbash-2027`. |
| `ADMITTO_MAIN_CONFERENCE_TICKET_TYPE_NAME` | Yes | Display name of the main conference ticket type. |
| `ADMITTO_IGNORED_TICKET_TYPE_IDS` | No | Comma-separated ticket type UUIDs to hide from the website. |
