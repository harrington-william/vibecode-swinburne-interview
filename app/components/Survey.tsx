"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  activeQuestions,
  EARLY_EXIT,
  endsEarly,
  isAnswered,
  isOtherSelected,
  SECTIONS,
  type Answers,
  type Section,
} from "@/app/lib/survey";
import ClassroomShuffle from "./ClassroomShuffle";
import Confetti from "./Confetti";
import QuestionCard from "./QuestionCard";

type Stage = "welcome" | "form" | "done";
type Status = "idle" | "sending" | "error";
type Value = string | string[];

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 10 H16 M11 5 L16 10 L11 15" />
    </svg>
  );
}

function Pencil() {
  return (
    <svg className="pencil-tip" width="28" height="28" viewBox="0 0 48 48" aria-hidden>
      <path d="M8 40 L10 30 L34 6 L42 14 L18 38 Z" fill="var(--marker)" stroke="var(--ink)" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M30 10 L38 18" stroke="var(--ink)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M8 40 L10 30 L18 38 Z" fill="var(--ink)" />
    </svg>
  );
}

export default function Survey() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Value>>({});
  const [others, setOthers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");

  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // On every screen change: scroll up and move focus to the new heading.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [stage, step]);

  const section: Section = SECTIONS[step];
  const early = endsEarly(answers);
  const active = activeQuestions(answers);
  const activeIds = new Set(active.map((q) => q.id));
  const visibleQuestions = section.questions.filter((q) => activeIds.has(q.id));
  // The last page is the final section, or the page holding the early-exit question.
  const isLast =
    step === SECTIONS.length - 1 ||
    (early && section.questions.some((q) => q.id === EARLY_EXIT.questionId));
  const answeredCount = active.filter((q) => isAnswered(q, answers[q.id], others[q.id])).length;
  const progress = Math.round((answeredCount / active.length) * 100);

  function clearError(id: string) {
    setErrors((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function setAnswer(id: string, value: Value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    clearError(id);
  }

  function setOther(id: string, text: string) {
    setOthers((prev) => ({ ...prev, [id]: text }));
    clearError(id);
  }

  function validate(target: Section) {
    const found: Record<string, string> = {};
    for (const q of target.questions) {
      if (!activeIds.has(q.id) || !q.required || isAnswered(q, answers[q.id], others[q.id])) continue;
      const value = answers[q.id];
      const missingOtherText =
        isOtherSelected(q, value) && (Array.isArray(value) ? value.length > 0 : value !== "");
      found[q.id] = missingOtherText
        ? `Tell us what “${q.otherText}” means for you.`
        : q.type === "text"
          ? "Please write a short answer."
          : q.type === "multi"
            ? "Pick at least one option."
            : "Please pick an answer.";
    }
    return found;
  }

  function rejectWith(found: Record<string, string>) {
    setErrors(found);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ids = Object.keys(found);
    ids.forEach((id) => {
      const el = document.getElementById(`q-${id}`);
      if (!el || reduceMotion) return;
      el.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-9px)" },
          { transform: "translateX(8px)" },
          { transform: "translateX(-5px)" },
          { transform: "translateX(3px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 420, easing: "ease-out" },
      );
    });
    document.getElementById(`q-${ids[0]}`)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  }

  function buildPayload(): Answers {
    const payload: Answers = {};
    for (const q of active) {
      const value = answers[q.id];
      if (value === undefined) continue;
      const otherText = (others[q.id] ?? "").trim();
      const resolve = (v: string) => (q.otherText && v === q.otherText && otherText ? `${v}: ${otherText}` : v);
      payload[q.id] = Array.isArray(value) ? value.map(resolve) : q.type === "text" ? value.trim() : resolve(value);
    }
    return payload;
  }

  async function submit() {
    setStatus("sending");
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: buildPayload() }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("idle");
      setStage("done");
    } catch {
      setStatus("error");
    }
  }

  function next() {
    const found = validate(section);
    if (Object.keys(found).length > 0) return rejectWith(found);
    setErrors({});
    if (isLast) void submit();
    else setStep(step + 1);
  }

  function back() {
    setErrors({});
    setStatus("idle");
    if (step === 0) setStage("welcome");
    else setStep(step - 1);
  }

  function restart() {
    setAnswers({});
    setOthers({});
    setErrors({});
    setStatus("idle");
    setStep(0);
    setStage("welcome");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-16">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-20 -mx-4 bg-paper/85 px-4 pb-3 pt-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-crimson text-white shadow-[3px_3px_0_var(--ink)]" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14 H44 V20 H4 Z M8 20 V40 M40 20 V40" />
              </svg>
            </span>
            <span className="font-display text-base font-semibold tracking-tight sm:text-lg">Classroom Desk Survey</span>
          </div>
          {stage === "form" && (
            <span className="whitespace-nowrap text-sm font-semibold text-ink-soft" aria-live="polite">
              {answeredCount}/{active.length}
              <span className="max-sm:sr-only"> answered</span>
            </span>
          )}
        </div>

        {stage === "form" && (
          <div
            className="progress-track mt-3"
            role="progressbar"
            aria-label="Survey progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <div className="progress-pencil" style={{ left: `${Math.max(progress, 3)}%` }}>
              <Pencil />
            </div>
          </div>
        )}
      </header>

      <main className="flex flex-1 flex-col">
        {/* ---------- Welcome ---------- */}
        {stage === "welcome" && (
          <section className="anim-rise mt-4 sm:mt-8">
            <div className="card !p-4 sm:!p-6">
              <div className="mx-auto max-w-md">
                <ClassroomShuffle />
              </div>
              <div className="mt-6 px-1 sm:px-2">
                <p className="font-hand text-2xl text-crimson">Psst… got 3 minutes?</p>
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="mt-1 font-display text-4xl font-semibold leading-[1.1] tracking-tight outline-none sm:text-5xl"
                >
                  How does your <span className="highlight">desk</span> really feel?
                </h1>
                <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                  We&apos;re rearranging the tables and chairs in our classroom, and we want the change to be
                  based on what students actually experience, not guesses. Your answers will shape the new
                  layout.
                </p>
                <ul className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
                  {["15 quick questions", "About 3 minutes", "Anonymous"].map((chip) => (
                    <li key={chip} className="rounded-full border-[1.5px] border-ink/15 bg-paper px-3 py-1.5">
                      {chip}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="btn btn-primary nudge-on-hover mt-7 w-full sm:w-auto"
                  onClick={() => {
                    setStage("form");
                    setStep(0);
                  }}
                >
                  Start the survey
                  <Arrow className="nudge-icon" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ---------- Form ---------- */}
        {stage === "form" && (
          <form
            key={section.id}
            noValidate
            className="mt-4 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
          >
            <div className="anim-rise px-1">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-ink-soft">
                Section {step + 1} of {SECTIONS.length}
              </p>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="mt-1 font-display text-3xl font-semibold tracking-tight outline-none sm:text-4xl"
              >
                <span className="highlight">{section.title}</span>
              </h2>
              <p className="mt-2 text-ink-soft">{section.blurb}</p>
            </div>

            {visibleQuestions.map((q, i) => (
              <Fragment key={q.id}>
                <QuestionCard
                  q={q}
                  value={answers[q.id]}
                  other={others[q.id] ?? ""}
                  error={errors[q.id]}
                  delay={120 + i * 90}
                  onChange={(v) => setAnswer(q.id, v)}
                  onOtherChange={(t) => setOther(q.id, t)}
                />
                {early && q.id === EARLY_EXIT.questionId && (
                  <p
                    role="status"
                    className="anim-rise flex items-start gap-3 rounded-2xl border-[1.5px] border-leaf bg-leaf/10 px-4 py-3 text-sm font-semibold text-ink"
                  >
                    <span aria-hidden className="text-lg leading-none">🎉</span>
                    Good news, your desk works for you! That&apos;s all we need, so the rest of the questions
                    are skipped. Just submit to finish.
                  </p>
                )}
              </Fragment>
            ))}

            {status === "error" && (
              <p role="alert" className="rounded-2xl border-[1.5px] border-crimson bg-crimson/10 px-4 py-3 text-sm font-semibold text-crimson">
                Something went wrong and your answers were not saved. Check your connection and try again.
              </p>
            )}

            <div className="mt-2 flex items-center justify-between gap-3">
              <button type="button" className="btn btn-ghost" onClick={back} disabled={status === "sending"}>
                Back
              </button>
              <button type="submit" className="btn btn-primary nudge-on-hover" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : isLast ? "Submit answers" : "Next section"}
                {status !== "sending" && <Arrow className="nudge-icon" />}
              </button>
            </div>
          </form>
        )}

        {/* ---------- Done ---------- */}
        {stage === "done" && (
          <section className="anim-rise mt-8 sm:mt-14">
            <Confetti />
            <div className="card flex flex-col items-center px-6 py-10 text-center sm:py-14">
              <div
                className="stamp grid h-36 w-36 place-items-center rounded-full border-[5px] border-double border-crimson text-crimson"
                aria-hidden
              >
                <div className="text-center leading-none">
                  <svg className="mx-auto mb-1" width="44" height="44" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8.5 L6.5 12 L13 4.5" />
                  </svg>
                  <span className="font-display text-xl font-bold uppercase tracking-widest">Received</span>
                </div>
              </div>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="mt-8 font-display text-4xl font-semibold tracking-tight outline-none sm:text-5xl"
              >
                Thank you!
              </h1>
              <p className="mt-3 max-w-md text-lg text-ink-soft">
                {early
                  ? "Since your desk already feels comfortable, that's all we need. Your answers still help us see what works."
                  : "Your answers are in. They'll help decide how our classroom desks and chairs get rearranged."}
              </p>
              <button type="button" className="btn btn-ghost mt-8" onClick={restart}>
                Submit another response
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="mt-10 text-center text-sm text-ink-soft">
        Anonymous · No personal data collected · A student project on classroom seating
      </footer>
    </div>
  );
}
