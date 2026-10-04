import axios from "axios";
import { validateSubmission } from "@/app/lib/survey";

// Each response is relayed to the Google Apps Script web app (see script.js),
// which appends it to the Google Sheet. The URL is the deployed /exec endpoint.
// TODO: move to an env var (APPS_SCRIPT_URL) once testing is done.
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby6Po7ajOs60Ph96fKwGeJ9H005HVLxd5kD8r1q_PQT7v4M3VWmDGUxiy22S5H-0xaV/exec";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = validateSubmission(body);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 422 });
  }

  try {
    // Apps Script answers POST with a 302 to googleusercontent; axios follows it.
    const res = await axios.post<{ ok: boolean; error?: string }>(
      APPS_SCRIPT_URL,
      {
        id: crypto.randomUUID(),
        submittedAt: new Date().toISOString(),
        answers: result.answers,
      },
      {
        // text/plain keeps this a simple request; Apps Script reads the raw body either way.
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        transformRequest: [(data) => JSON.stringify(data)],
        timeout: 15000,
      },
    );
    if (!res.data.ok)
      throw new Error(`Apps Script error: ${JSON.stringify(res.data)}`);
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Could not save your response" },
      { status: 500 },
    );
  }

  return Response.json({ ok: true }, { status: 201 });
}
