import { promises as fs } from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";
import { QUESTIONS, validateSubmission, type Answers } from "@/app/lib/survey";

// Responses are appended to data/responses.jsonl (one JSON object per line).
// Note: this needs a writable filesystem, so it works locally / on a server or VM,
// but not on serverless hosts such as Vercel.
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "responses.jsonl");

type StoredResponse = { id: string; submittedAt: string; answers: Answers };

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

  const record: StoredResponse = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    answers: result.answers,
  };

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(DATA_FILE, JSON.stringify(record) + "\n", "utf8");
  } catch {
    return Response.json({ error: "Could not save your response" }, { status: 500 });
  }
  return Response.json({ ok: true }, { status: 201 });
}

// GET /api/responses -> CSV download of every response.
// Open in `next dev`; in production it needs ?token=<RESULTS_TOKEN>.
export async function GET(request: NextRequest) {
  const token = process.env.RESULTS_TOKEN;
  const allowed =
    process.env.NODE_ENV !== "production" ||
    (token !== undefined && token !== "" && request.nextUrl.searchParams.get("token") === token);
  if (!allowed) return new Response("Not found", { status: 404 });

  let lines: string[] = [];
  try {
    lines = (await fs.readFile(DATA_FILE, "utf8")).split("\n").filter(Boolean);
  } catch {
    // No responses yet: fall through to a header-only CSV.
  }

  const rows = lines.flatMap((line) => {
    try {
      return [JSON.parse(line) as StoredResponse];
    } catch {
      return [];
    }
  });

  const header = ["id", "submittedAt", ...QUESTIONS.map((q) => `Q${q.number}. ${q.label}`)];
  const body = rows.map((r) => [
    r.id,
    r.submittedAt,
    ...QUESTIONS.map((q) => {
      const v = r.answers[q.id];
      return Array.isArray(v) ? v.join(" | ") : (v ?? "");
    }),
  ]);
  const csv = [header, ...body].map((row) => row.map(csvCell).join(",")).join("\r\n");

  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="desk-survey-responses.csv"',
      "Cache-Control": "no-store",
    },
  });
}

function csvCell(value: string) {
  // Neutralise spreadsheet formulas typed by respondents (=, +, -, @).
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}
