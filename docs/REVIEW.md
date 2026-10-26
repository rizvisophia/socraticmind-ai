# Review checklist

1. Install Node.js 22.9+; run `npm ci`, `npm run check`, and `npm test`.
2. Run `npm start`, open `http://localhost:3000`, and verify all four subjects work in guided practice.
3. Select the anatomy lesson and click each chamber of the heart diagram; verify informational labels change.
4. Verify that Hint and Break it down provide responses without advancing the answer counter.
5. Send the lesson-specific number of answers (three to five); observe a closing synthesis and disabled reply field.
6. With no API key configured, verify Use live AI cannot start a live session.
7. **Optional live smoke test:** obtain a valid Responses API key and compatible model, privately fill in `.env`, restart, choose Use live AI, answer a question, request a hint, and confirm that lesson-specific adaptive feedback arrives.
8. Inspect the browser Network panel: requests go to `/api/...` on the same origin; no browser request should contain an OpenAI key.
9. Before publishing, verify `.env` is excluded and inspect `git diff --cached`.

## Boundaries of automated checks

These tests cover progression, JSON output validation, and server behavior without relying on an external model or credential. They do not establish factual quality, pedagogical quality, browser cross-compatibility, or a working paid OpenAI account. Review the live responses with a knowledgeable instructor before deployment.
