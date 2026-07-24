import { createOpenAIOAuth } from "@openai-oauth/ai-sdk";
import { openaiCredentials } from "@openai-oauth/react/server";
import { streamText } from "ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: unknown };
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

  if (!prompt) {
    return new Response("A prompt is required.", { status: 400 });
  }

  if (prompt.length > 12_000) {
    return new Response("Prompt is too long.", { status: 413 });
  }

  const openai = createOpenAIOAuth(openaiCredentials(request));
  const result = streamText({
    model: openai(process.env.CANVAS_MODEL ?? "gpt-5.4-mini"),
    prompt
  });

  return result.toTextStreamResponse();
}
