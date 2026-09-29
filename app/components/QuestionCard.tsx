import { isOtherSelected, OTHER_MAX_LENGTH, TEXT_MAX_LENGTH, type Question } from "@/app/lib/survey";

type Props = {
  q: Question;
  value: string | string[] | undefined;
  other: string;
  error?: string;
  delay: number;
  onChange: (value: string | string[]) => void;
  onOtherChange: (text: string) => void;
};

const scaleCols: Record<number, string> = {
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
};

function Tick() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5 L6.5 12 L13 4.5" />
    </svg>
  );
}

export default function QuestionCard({ q, value, other, error, delay, onChange, onOtherChange }: Props) {
  const labelId = `${q.id}-label`;
  const errorId = `${q.id}-error`;
  const selected = Array.isArray(value) ? value : [];
  const atLimit = q.type === "multi" && q.max !== undefined && selected.length >= q.max;
  const otherOpen = isOtherSelected(q, value);
  const scale = q.layout === "scale";

  const layoutClass = scale
    ? `grid gap-2 ${scaleCols[q.options?.length ?? 5] ?? "sm:grid-cols-5"}`
    : q.layout === "grid"
      ? "grid gap-2 sm:grid-cols-2"
      : "grid gap-2";

  function toggle(option: string) {
    if (q.type === "multi") {
      onChange(selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option]);
    } else {
      onChange(option);
    }
  }

  return (
    <div
      id={`q-${q.id}`}
      className={`card anim-rise scroll-mt-28 ${error ? "card-error" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <span className="qbadge mt-0.5">Q{q.number}</span>
        <div className="min-w-0">
          <h3 id={labelId} className="text-lg font-semibold leading-snug sm:text-xl">
            {q.label}
            {q.required && (
              <span aria-hidden className="ml-1 text-crimson" title="Required">
                *
              </span>
            )}
          </h3>
          {q.hint && (
            <p className="mt-1 font-hand text-xl leading-none text-ink-soft">
              {q.hint}
              {q.max !== undefined && (
                <span className="ml-2 rounded-full bg-marker px-2 py-0.5 font-sans text-xs font-bold text-ink">
                  {selected.length}/{q.max}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        {q.type === "text" ? (
          <div>
            <textarea
              aria-labelledby={labelId}
              aria-describedby={error ? errorId : undefined}
              aria-required={q.required}
              className="field ruled"
              rows={4}
              maxLength={TEXT_MAX_LENGTH}
              placeholder={q.placeholder}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(e.target.value)}
            />
            <p className="mt-1 text-right text-xs text-ink-soft" aria-hidden>
              {(typeof value === "string" ? value : "").length}/{TEXT_MAX_LENGTH}
            </p>
          </div>
        ) : (
          <>
            <div
              role={q.type === "multi" ? "group" : "radiogroup"}
              aria-labelledby={labelId}
              aria-describedby={error ? errorId : undefined}
              className={layoutClass}
            >
              {q.options?.map((option, i) => {
                const checked = q.type === "multi" ? selected.includes(option) : value === option;
                return (
                  <label key={option} className={`option ${scale ? "option-scale" : ""}`}>
                    <input
                      className="sr-only"
                      type={q.type === "multi" ? "checkbox" : "radio"}
                      name={q.id}
                      value={option}
                      checked={checked}
                      disabled={atLimit && !checked}
                      onChange={() => toggle(option)}
                    />
                    <span className={`mark ${q.type === "multi" ? "mark-box" : ""}`} aria-hidden>
                      {scale ? i + 1 : <Tick />}
                    </span>
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>

            {q.otherText && (
              <div className={`expand ${otherOpen ? "expand-open" : ""}`}>
                <div inert={!otherOpen}>
                  <input
                    type="text"
                    className="field"
                    aria-label={`${q.otherText}: please specify`}
                    placeholder={q.placeholder ?? "Please specify"}
                    maxLength={OTHER_MAX_LENGTH}
                    value={other}
                    onChange={(e) => onOtherChange(e.target.value)}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-3 flex items-center gap-2 text-sm font-semibold text-crimson">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 4.5 V8.5 M8 11 V11.2" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
