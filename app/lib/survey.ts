export type Answers = Record<string, string | string[]>;

export type Question = {
  id: string;
  number: number;
  type: "single" | "multi" | "text";
  label: string;
  hint?: string;
  required: boolean;
  options?: string[];
  /** Option that reveals a free-text field, e.g. "Other: ______". */
  otherText?: string;
  /** Max selections for multi-choice questions. */
  max?: number;
  /** "scale" = Likert-style row, "grid" = two columns, "list" = one column. */
  layout?: "scale" | "grid" | "list";
  placeholder?: string;
};

export type Section = {
  id: string;
  title: string;
  blurb: string;
  questions: Question[];
};

const frequency5 = ["Never", "Rarely", "Sometimes", "Often", "Always"];

export const SECTIONS: Section[] = [
  {
    id: "basic",
    title: "Basic information",
    blurb: "Just the essentials. No names, no emails.",
    questions: [
      {
        id: "q1",
        number: 1,
        type: "single",
        label: "What is your year of study?",
        required: true,
        layout: "grid",
        options: ["First year", "Second year", "Third year", "Fourth year", "Other"],
      },
      {
        id: "q2",
        number: 2,
        type: "single",
        label: "How often do you use this type of desk?",
        required: true,
        layout: "grid",
        options: ["Every day", "Several times a week", "Once a week", "Rarely"],
      },
    ],
  },
  {
    id: "experience",
    title: "Current experience",
    blurb: "Think about a normal class in your current classroom.",
    questions: [
      {
        id: "q3",
        number: 3,
        type: "single",
        label: "How long do you usually sit at a desk during one class?",
        required: true,
        layout: "grid",
        options: ["Less than 30 minutes", "30–60 minutes", "1–2 hours", "More than 2 hours"],
      },
      {
        id: "q4",
        number: 4,
        type: "single",
        label: "How comfortable do you feel when using the current desks?",
        required: true,
        layout: "scale",
        options: ["Very comfortable", "Comfortable", "Neutral", "Uncomfortable", "Very uncomfortable"],
      },
      {
        id: "q5",
        number: 5,
        type: "single",
        label: "Do you find it difficult to maintain a comfortable sitting position during class?",
        required: true,
        layout: "scale",
        options: frequency5,
      },
      {
        id: "q6",
        number: 6,
        type: "single",
        label: "Which part of your body feels uncomfortable after sitting for a long time?",
        required: true,
        layout: "grid",
        options: [
          "Neck",
          "Shoulders",
          "Upper back",
          "Lower back",
          "Legs",
          "No discomfort",
          "Other",
        ],
        otherText: "Other",
        placeholder: "Which part?",
      },
    ],
  },
  {
    id: "cause",
    title: "Finding the cause",
    blurb: "Let's figure out what is behind the discomfort.",
    questions: [
      {
        id: "q7",
        number: 7,
        type: "multi",
        label: "What do you think causes the discomfort?",
        hint: "Select all that apply",
        required: true,
        layout: "grid",
        options: [
          "Desk height",
          "Desk size",
          "Chair/bench design",
          "Lack of back support",
          "Limited space",
          "Desk arrangement",
          "Sitting for too long",
          "Other",
        ],
        otherText: "Other",
        placeholder: "What else?",
      },
      {
        id: "q8",
        number: 8,
        type: "single",
        label: "Do you often have to bend your neck or hunch your back when studying?",
        required: true,
        layout: "scale",
        options: frequency5,
      },
      {
        id: "q9",
        number: 9,
        type: "single",
        label:
          "Do you feel that the current desk and seating arrangement allows you to change your sitting position easily?",
        required: true,
        layout: "scale",
        options: ["Yes", "Somewhat", "No"],
      },
    ],
  },
  {
    id: "impact",
    title: "Impact",
    blurb: "Does it actually matter for how you learn?",
    questions: [
      {
        id: "q10",
        number: 10,
        type: "single",
        label: "Does discomfort from sitting affect your concentration in class?",
        required: true,
        layout: "scale",
        options: ["Not at all", "Slightly", "Moderately", "Significantly", "Very significantly"],
      },
      {
        id: "q11",
        number: 11,
        type: "single",
        label: "Have you ever changed your sitting position because you felt uncomfortable?",
        required: true,
        layout: "scale",
        options: frequency5,
      },
      {
        id: "q12",
        number: 12,
        type: "single",
        label: "How important do you think it is to improve the current classroom desks and seating?",
        required: true,
        layout: "scale",
        options: ["Not important", "Slightly important", "Moderately important", "Important", "Very important"],
      },
    ],
  },
  {
    id: "solutions",
    title: "Solutions",
    blurb: "Now the fun part: what would you actually want?",
    questions: [
      {
        id: "q13",
        number: 13,
        type: "multi",
        label: "Which improvement would make the desks more comfortable?",
        hint: "Select up to 2",
        required: true,
        max: 2,
        layout: "grid",
        options: [
          "Adjustable desk height",
          "More desk space",
          "Better chairs with back support",
          "More space between desks",
          "Different desk arrangement",
          "More comfortable desk surface",
          "Other",
        ],
        otherText: "Other",
        placeholder: "What would help?",
      },
      {
        id: "q14",
        number: 14,
        type: "text",
        label:
          "If the university/classroom could change one thing about the current desks, what would you change?",
        hint: "Short answer",
        required: true,
        placeholder: "Type your answer here…",
      },
    ],
  },
  {
    id: "last",
    title: "One last thing",
    blurb: "Optional, but we read every single one.",
    questions: [
      {
        id: "q15",
        number: 15,
        type: "text",
        label: "Do you have any other suggestions about the classroom desks or seating?",
        hint: "Optional · short answer",
        required: false,
        placeholder: "Anything else on your mind…",
      },
    ],
  },
];

export const QUESTIONS: Question[] = SECTIONS.flatMap((s) => s.questions);
export const TOTAL_QUESTIONS = QUESTIONS.length;

export const TEXT_MAX_LENGTH = 1000;
export const OTHER_MAX_LENGTH = 200;

/** True when the "Other" option is currently selected for this question. */
export function isOtherSelected(q: Question, value: string | string[] | undefined) {
  if (!q.otherText || value === undefined) return false;
  return Array.isArray(value) ? value.includes(q.otherText) : value === q.otherText;
}

export function isAnswered(
  q: Question,
  value: string | string[] | undefined,
  otherValue: string | undefined,
) {
  if (value === undefined) return false;
  if (q.type === "text") return typeof value === "string" && value.trim() !== "";
  const hasChoice = Array.isArray(value) ? value.length > 0 : value !== "";
  if (!hasChoice) return false;
  return !isOtherSelected(q, value) || (otherValue ?? "").trim() !== "";
}

/** Server-side check: the payload must match the survey definition exactly. */
export function validateSubmission(
  input: unknown,
): { ok: true; answers: Answers } | { ok: false; error: string } {
  const raw = (input as { answers?: unknown } | null)?.answers;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Missing answers" };
  }
  const source = raw as Record<string, unknown>;
  const known = new Set(QUESTIONS.map((q) => q.id));
  if (Object.keys(source).some((key) => !known.has(key))) {
    return { ok: false, error: "Unknown question" };
  }

  const isValidChoice = (q: Question, v: unknown): v is string => {
    if (typeof v !== "string") return false;
    if (q.options?.includes(v)) return true;
    if (!q.otherText) return false;
    const prefix = `${q.otherText}: `;
    const rest = v.slice(prefix.length);
    return v.startsWith(prefix) && rest.trim() !== "" && rest.length <= OTHER_MAX_LENGTH;
  };

  const answers: Answers = {};
  for (const q of QUESTIONS) {
    const v = source[q.id];
    const empty = v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
    if (empty) {
      if (q.required) return { ok: false, error: `Question ${q.number} is required` };
      continue;
    }
    if (q.type === "text") {
      if (typeof v !== "string" || v.length > TEXT_MAX_LENGTH) {
        return { ok: false, error: `Question ${q.number} is invalid` };
      }
      if (v.trim() !== "") answers[q.id] = v.trim();
      else if (q.required) return { ok: false, error: `Question ${q.number} is required` };
    } else if (q.type === "single") {
      if (!isValidChoice(q, v)) return { ok: false, error: `Question ${q.number} is invalid` };
      answers[q.id] = v;
    } else {
      const limit = q.max ?? q.options?.length ?? 0;
      if (
        !Array.isArray(v) ||
        v.length > limit ||
        new Set(v).size !== v.length ||
        !v.every((item) => isValidChoice(q, item))
      ) {
        return { ok: false, error: `Question ${q.number} is invalid` };
      }
      answers[q.id] = v as string[];
    }
  }
  return { ok: true, answers };
}
