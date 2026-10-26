# SocraticMind AI

A browser-based Socratic tutoring project for anatomy, physics, algebra, and Richmond, Virginia history. It includes an interactive heart diagram, guided lesson practice, and a Node.js backend integrating with OpenAI's Responses API.

**Review-ready source:** automated tests are included. No OpenAI API key, model ID, or private credential is provided.

## Run locally

Requires **Node.js 22.9+** (Node.js 24 recommended). No third-party runtime packages or build step.

```bash
npm ci
cp .env.example .env
npm start
```

On Windows PowerShell use `Copy-Item .env.example .env` instead of `cp`.

Open http://localhost:3000. With no OpenAI configuration, four guided-practice lessons work. To enable live tutoring, privately edit `.env`:

```dotenv
OPENAI_API_KEY=your_real_key_here
OPENAI_MODEL=your_responses_compatible_model_id
```

Restart the server and click **Use live AI**. The opening question is curated; later answers, hints, and break-down requests are routed through the Node.js backend to OpenAI. The heart diagram is a local interactive SVG, **not** image recognition. An OpenAI API account with enabled model access and billing is required. Never insert credentials into frontend files.

## Architecture and learning flow

HTML and CSS render the interface; browser JavaScript sends requests to the Node.js backend. The **Socratic Question Engine** provides lesson context, a conversation history and an answer-turn counter. The AI returns one guiding question or hint at a time. The engine aims to close each lesson in **3–6 student answer turns**, depending on the complexity and student progress. This is a bounded tutoring workflow, not proof of mastery or a guarantee that the AI will always produce an ideal instructional response. Hints and break-down requests do not increase the answer-turn counter.

The backend keeps credentials and conversation sessions server-side. Sessions are in memory, expire after two hours, and disappear on restart. The app supports a single Node.js instance; distributed sessions would need a persistent shared store. Provider errors are returned as generic client messages.

## Checks

```bash
npm run check
npm test
```

Tests inject local practice scenarios and check server routes. They do **not** prove model quality or a successful live API/account connection. See [Review checklist](docs/REVIEW.md) for an optional live smoke test.

## Put this on GitHub

Create a new empty repository, extract this ZIP and run from inside the project directory:

```bash
git init
git add .
git diff --cached
git commit -m "Add SocraticMind tutoring app and OpenAI backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/socraticmind-ai.git
git push -u origin main
```

Replace `YOUR_USERNAME`. `.gitignore` excludes `.env`; only the placeholder `.env.example` belongs in the repository. Inspect staged changes for accidental credentials. Add the student's accurate identity and contributions in [CONTRIBUTIONS.md](CONTRIBUTIONS.md). No license is assumed; choose one before inviting reuse.

## Hosting

GitHub hosts the source, but **GitHub Pages cannot run this backend**. Use a Node.js 24-capable host with HTTPS termination at the edge. Run `npm start`, and set these host environment values privately:

```dotenv
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
APP_ORIGIN=https://your-real-domain.example
APP_ACCESS_TOKEN=replace-with-a-long-random-private-code
OPENAI_API_KEY=your_real_key_here
OPENAI_MODEL=your_responses_compatible_model_id
```

Use the hosting provider's `PORT` if assigned. `APP_ORIGIN` must exactly match the browser origin, without a trailing slash. HTTPS termination is done by the host proxy; production cookies use `Secure`. The reviewer access code is entered by the visitor when prompted and sent only to the backend. Share it separately. This simple access gate is for private review, **not** a production-scale login system. The app uses a single in-memory process; restarting loses conversations. Do not publish the repository root as web content: this server serves only allowlisted `public/` assets.

## Review documents

- [Architecture and API contracts](docs/ARCHITECTURE.md)
- [Tests, limitations, and live smoke test](docs/REVIEW.md)
- [Technical explanation](docs/NARRATION.md)
- [Contribution disclosure](CONTRIBUTIONS.md)

## What makes it different

This project emphasizes a guided learning workflow: students attempt an answer, receive feedback or hints, then tackle the next focused question. OpenAI generates the live tutoring language, while the application manages lesson context, state, interaction counting, and UI. This teaching approach is a design choice, not a claim that other AI services cannot tutor.
