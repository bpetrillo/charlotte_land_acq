import { scoreColor } from "../utils/scoring.js";

/**
 * Colored pill / badge component.
 */
export function Pill({ children, color }) {
  return (
    <span
      style={{
        background: color + "18",
        color,
        border: `1px solid ${color}35`,
        borderRadius: 5,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/**
 * Circular SVG score ring.
 */
export function ScoreRing({ pct, size = 52 }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const color = scoreColor(pct);

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#1e293b"
        strokeWidth={size * 0.09}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={size * 0.09}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fill: color,
          fontSize: size * 0.22,
          fontWeight: 700,
          transform: `rotate(90deg)`,
          transformOrigin: `${size / 2}px ${size / 2}px`,
        }}
      >
        {pct}%
      </text>
    </svg>
  );
}

/**
 * Horizontal score bar with label.
 */
export function ScoreBar({ label, icon, score, isKey }) {
  const color = scoreColor(score * 20);

  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <span style={{ color: "#94a3b8", fontSize: 12 }}>
          {icon} {label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isKey && (
            <span
              style={{
                fontSize: 9,
                color: "#f59e0b",
                background: "#f59e0b15",
                borderRadius: 3,
                padding: "1px 5px",
              }}
            >
              KEY
            </span>
          )}
          <span style={{ color, fontSize: 12, fontWeight: 700 }}>{score}/5</span>
        </div>
      </div>
      <div style={{ background: "#0f172a", borderRadius: 4, height: 6 }}>
        <div
          style={{
            height: "100%",
            width: `${score * 20}%`,
            background: color,
            borderRadius: 4,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}
