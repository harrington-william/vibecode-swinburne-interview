import type { CSSProperties } from "react";

const colors = ["var(--crimson)", "var(--marker)", "var(--sky)", "var(--leaf)", "var(--ink)"];

// Deterministic 0..1 "random" so the output is pure and stable across renders.
const rand = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const pieces = Array.from({ length: 56 }, (_, i) => ({
  left: `${rand(i + 1) * 100}%`,
  dx: `${(rand(i + 100) - 0.5) * 240}px`,
  rot: `${(rand(i + 200) - 0.5) * 1400}deg`,
  dur: `${2.6 + rand(i + 300) * 2.2}s`,
  delay: `${rand(i + 400) * 0.9}s`,
  w: 6 + rand(i + 500) * 7,
  h: 10 + rand(i + 600) * 8,
  color: colors[i % colors.length],
  round: i % 4 === 0,
}));

export default function Confetti() {
  return (
    <div aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti"
          style={
            {
              left: p.left,
              width: p.w,
              height: p.h,
              background: p.color,
              borderRadius: p.round ? "999px" : "2px",
              "--dx": p.dx,
              "--rot": p.rot,
              "--dur": p.dur,
              "--delay": p.delay,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
