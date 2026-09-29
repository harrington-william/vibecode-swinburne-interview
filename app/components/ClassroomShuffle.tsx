import type { CSSProperties } from "react";

/**
 * A tiny classroom that keeps rearranging itself: rows of desks facing the
 * board, then two group pods, then back again. It's the project in one image.
 */

// Start layout: 2 rows x 4 columns facing the board.
const rowSlots = [0, 1].flatMap((row) =>
  [0, 1, 2, 3].map((col) => ({ x: 70 + col * 60, y: 78 + row * 52 })),
);

// End layout: two pods of four desks; the outer desks turn their chairs outward.
const pods = [
  { cx: 90, cy: 122 },
  { cx: 230, cy: 122 },
];
const podOffsets = [
  { dx: -20, dy: -12, r: 180 },
  { dx: 20, dy: -12, r: 180 },
  { dx: -20, dy: 12, r: 0 },
  { dx: 20, dy: 12, r: 0 },
];
// desk index -> [pod, slot in pod]
const podSlot = [
  [0, 0], [0, 1], [1, 0], [1, 1],
  [0, 2], [0, 3], [1, 2], [1, 3],
];

const colors = ["var(--sky)", "var(--crimson)", "var(--leaf)", "#d9a400"];

export default function ClassroomShuffle() {
  return (
    <svg
      viewBox="0 0 320 200"
      role="img"
      aria-label="Animation of classroom desks moving from straight rows into small groups"
      className="w-full h-auto"
    >
      <rect x="4" y="4" width="312" height="192" rx="18" fill="#fff" stroke="var(--ink)" strokeOpacity="0.85" strokeWidth="2.5" />
      {/* board */}
      <rect x="80" y="14" width="160" height="14" rx="5" fill="var(--ink)" />
      <path d="M96 21 H130 M140 21 H170" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
      {/* door */}
      <rect x="292" y="150" width="12" height="34" rx="3" fill="none" stroke="var(--ink)" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="4 3" />

      {rowSlots.map((slot, i) => {
        const [pod, k] = podSlot[i];
        const end = podOffsets[k];
        const style = {
          "--x0": `${slot.x}px`,
          "--y0": `${slot.y}px`,
          "--x1": `${pods[pod].cx + end.dx}px`,
          "--y1": `${pods[pod].cy + end.dy}px`,
          "--r1": `${end.r}deg`,
        } as CSSProperties;
        const color = colors[i % colors.length];
        return (
          <g key={i} className="desk-piece" style={style}>
            {/* chair */}
            <rect x="-8" y="11" width="16" height="10" rx="4" fill={color} opacity="0.9" />
            {/* desk top */}
            <rect x="-18" y="-10" width="36" height="20" rx="5" fill="var(--marker-soft)" stroke="var(--ink)" strokeWidth="2" />
            <path d="M-9 -3 H9" stroke="var(--ink)" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
}
