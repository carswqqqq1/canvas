# Canvas

Canvas is a focused web client that lets a user connect their own ChatGPT/Codex
plan and send prompts through a server-side route.

It uses the community-maintained
[`openai-oauth`](https://github.com/EvanZhouDev/openai-oauth) packages:

- `@openai-oauth/react` for the browser sign-in flow and encrypted local session.
- `@openai-oauth/ai-sdk` for the server-side model adapter.
- Vercel AI SDK for streaming text.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The hosted browser sign-in flow may ask you to install the open-source
**Sign in with ChatGPT** extension for Chrome or Firefox. That requirement comes
from `openai-oauth`; Canvas does not collect a password.

## Configuration

Copy `.env.example` to `.env.local` only if you want to override the model:

```text
CANVAS_MODEL=gpt-5.4-mini
```

## Security notes

- OAuth material is never committed to the repository.
- Browser credentials are attached only to the request that calls `/api/chat`.
- The server route does not log authorization headers.
- Do not deploy this as an open proxy.
- Review the `openai-oauth` project and its browser extension before signing in.
- This project is not affiliated with or endorsed by OpenAI.

## Deploy to Cloudflare Pages

Run `npm run deploy`. The packaging script keeps Next.js static assets out of
the Pages Worker route so stylesheets and client bundles are served directly.

## School networks

Canvas is not intended to evade a firewall, content filter, or school policy.
Use it only where your network administrator permits it.

## License

MIT. The `openai-oauth` dependency is separately licensed under Apache-2.0.
