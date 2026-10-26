# SocraticMind AI

A browser-based Socratic tutoring project for subjects like anatomy, physics, algebra, and Richmond, Virginia history, etc. It includes an interactive heart diagram, repeatable scripted practice, and an implemented Node.js backend that connects to OpenAI's Responses API.

**Note:** review-ready source with passing automated tests. No OpenAI API key is provided here.

## Run locally

Requires Node.js 22.9+ (Node.js 24 recommended). No third-party runtime packages or build step.

```bash
npm ci
cp .env.example .env
npm start
```

Open http://localhost:3000. Without API configuration, the four scripted lessons work. For live tutoring, privately edit `.env`:

```dotenv
OPENAI_API_KEY=your_real_key_here
OPENAI_MODEL=your_responses_compatible_model_id
```

Restart the server and click **Use live AI**. The initial question remains curated; subsequent replies go through your backend to OpenAI. Hint and Break it down also request live replies. The diagram remains a local interactive SVG, not image recognition. An OpenAI API account with usable model access and billing is required; never put credentials in frontend files.

## Checks

```bash
npm run check
npm test
```

Tests inject provider responses; they do not prove model quality or a successful live account connection. See [review checklist](docs/REVIEW.md) for the live smoke test.

## Put this on GitHub

Unzip the project, open its directory, and create an empty repository in your GitHub account. Then run:

```bash
git init
git add .
git commit -m "Add SocraticMind tutoring app and OpenAI backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/socraticmind-ai.git
git push -u origin main
```

Replace YOUR_USERNAME and repository name. `.gitignore` excludes `.env`; only the empty `.env.example` belongs in GitHub. Before committing, inspect `git diff --cached` for accidental credentials. Add the student author's accurate identity and contribution statement in your submission. Review the AI assistance disclosure in [CONTRIBUTIONS.md](CONTRIBUTIONS.md). No license is assumed; choose one before inviting reuse.

## Hosting

GitHub stores the source. **GitHub Pages cannot run this Node.js backend.** Use a host capable of a long-running Node.js 24 process, with HTTPS in front of it.

Start command: `npm start`. Set these secrets/environment values in the host's settings:

```dotenv
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
APP_ORIGIN=https://your-real-domain.example
APP_ACCESS_TOKEN=a-long-random-reviewer-access-code
OPENAI_API_KEY=your_real_key_here
OPENAI_MODEL=your_responses_compatible_model_id
```

Use the host-assigned PORT if provided. APP_ORIGIN must exactly match the browser origin without a trailing slash. Terminate HTTPS at the hosting proxy; production session cookies use Secure. Share the reviewer access code separately. A single instance is required for this in-memory session design. Restarting loses conversations. Do not mount the repository root as static web content; this server serves only allowlisted files from `public/`.

## Review documents

- [Architecture and API contracts](docs/ARCHITECTURE.md)
- [Tests, limitations, and live smoke test](docs/REVIEW.md)
- [Technical narration](docs/NARRATION.md)
- [Contribution disclosure](CONTRIBUTIONS.md)

## What makes it different

The application focuses on a guided learning workflow: a student's attempt leads to feedback, a hint, and another question. Live mode supplies lesson-specific instructions to the AI; scripted mode provides a predictable recording path. This teaching approach is a product design choice, not a claim that other AI services cannot tutor.
