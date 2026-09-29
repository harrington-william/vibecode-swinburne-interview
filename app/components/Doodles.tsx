import type { CSSProperties, ReactNode } from "react";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const icons: Record<string, ReactNode> = {
  pencil: (
    <g {...stroke}>
      <path d="M8 40 L10 30 L34 6 L42 14 L18 38 Z" />
      <path d="M30 10 L38 18" />
      <path d="M8 40 L18 38" />
    </g>
  ),
  book: (
    <g {...stroke}>
      <path d="M6 10 Q16 6 24 12 Q32 6 42 10 V38 Q32 34 24 40 Q16 34 6 38 Z" />
      <path d="M24 12 V40" />
    </g>
  ),
  cap: (
    <g {...stroke}>
      <path d="M4 18 L24 8 L44 18 L24 28 Z" />
      <path d="M12 23 V33 Q24 40 36 33 V23" />
      <path d="M44 18 V30" />
    </g>
  ),
  chair: (
    <g {...stroke}>
      <path d="M14 6 H32 V24 H14 Z" />
      <path d="M12 24 H34 V30 H12 Z" />
      <path d="M15 30 V42 M31 30 V42" />
    </g>
  ),
  desk: (
    <g {...stroke}>
      <path d="M4 14 H44 V20 H4 Z" />
      <path d="M8 20 V40 M40 20 V40" />
      <path d="M16 20 V30 H32 V20" />
    </g>
  ),
  bulb: (
    <g {...stroke}>
      <path d="M17 32 Q9 26 9 18 A15 15 0 0 1 39 18 Q39 26 31 32 V36 H17 Z" />
      <path d="M18 42 H30" />
    </g>
  ),
  ruler: (
    <g {...stroke}>
      <path d="M4 16 H44 V32 H4 Z" />
      <path d="M12 16 V24 M20 16 V22 M28 16 V24 M36 16 V22" />
    </g>
  ),
  star: (
    <g {...stroke}>
      <path d="M24 5 L29 18 L43 19 L32 28 L36 42 L24 34 L12 42 L16 28 L5 19 L19 18 Z" />
    </g>
  ),
};

type Doodle = {
  icon: keyof typeof icons;
  left: string;
  top: string;
  size: number;
  color: string;
  dur: number;
  delay: number;
  dx: number;
  dy: number;
  r0: number;
  r1: number;
};

const doodles: Doodle[] = [
  { icon: "pencil", left: "6%", top: "14%", size: 54, color: "var(--sky)", dur: 15, delay: 0, dx: 14, dy: -24, r0: -12, r1: 10 },
  { icon: "book", left: "88%", top: "10%", size: 58, color: "var(--crimson)", dur: 17, delay: -4, dx: -10, dy: 20, r0: 8, r1: -8 },
  { icon: "cap", left: "92%", top: "44%", size: 60, color: "var(--ink)", dur: 19, delay: -8, dx: -16, dy: -18, r0: -6, r1: 12 },
  { icon: "chair", left: "3%", top: "48%", size: 50, color: "var(--leaf)", dur: 16, delay: -2, dx: 12, dy: 22, r0: 10, r1: -10 },
  { icon: "bulb", left: "82%", top: "76%", size: 52, color: "#d9a400", dur: 14, delay: -6, dx: -12, dy: -20, r0: -8, r1: 8 },
  { icon: "desk", left: "8%", top: "82%", size: 62, color: "var(--crimson)", dur: 18, delay: -10, dx: 16, dy: -16, r0: 6, r1: -6 },
  { icon: "ruler", left: "50%", top: "3%", size: 56, color: "var(--leaf)", dur: 20, delay: -3, dx: 20, dy: 14, r0: -14, r1: 6 },
  { icon: "star", left: "70%", top: "92%", size: 40, color: "var(--sky)", dur: 12, delay: -5, dx: -10, dy: -14, r0: 0, r1: 40 },
  { icon: "star", left: "20%", top: "30%", size: 30, color: "#d9a400", dur: 13, delay: -7, dx: 8, dy: 16, r0: 0, r1: -40 },
];

/** Decorative floating school supplies behind the page. Pure CSS motion. */
export default function Doodles() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {doodles.map((d, i) => (
        <svg
          key={i}
          viewBox="0 0 48 48"
          className="doodle absolute opacity-[0.22] max-sm:hidden"
          width={d.size}
          height={d.size}
          style={
            {
              left: d.left,
              top: d.top,
              color: d.color,
              "--dur": `${d.dur}s`,
              "--delay": `${d.delay}s`,
              "--dx": `${d.dx}px`,
              "--dy": `${d.dy}px`,
              "--r0": `${d.r0}deg`,
              "--r1": `${d.r1}deg`,
            } as CSSProperties
          }
        >
          {icons[d.icon]}
        </svg>
      ))}
    </div>
  );
}
