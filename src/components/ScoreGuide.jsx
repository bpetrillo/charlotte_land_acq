import { SITE_TYPES, TYPE_COLORS, TYPE_ICONS, CRITERIA, WEIGHTS } from "../constants";

export default function ScoreGuide() {
  return (
    <div
      style={{ padding: 32, overflowY: "auto", height: "100%", boxSizing: "border-box" }}
    >
      <div style={{ maxWidth: 620 }}>
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 20,
            marginBottom: 6,
          }}
        >
          Scoring Guide
        </div>
        <div style={{ color: "#475569", fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
          Each site type applies different weights to your 6 criteria. "KEY" factors carry
          1.3–1.5× weight — for example, school districts matter far more for Residential
          than Commercial.
        </div>

        {SITE_TYPES.map((type) => (
          <div
            key={type}
            style={{
              background: "#06101e",
              border: "1px solid #1a2840",
              borderTop: `3px solid ${TYPE_COLORS[type]}`,
              borderRadius: 10,
              padding: 20,
              marginBottom: 14,
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}
            >
              <span style={{ fontSize: 20 }}>{TYPE_ICONS[type]}</span>
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                }}
              >
                {type}
              </span>
            </div>

            {CRITERIA.map((c) => {
              const wt = WEIGHTS[type][c.key];
              const isKey = wt > 1.2;
              return (
                <div
                  key={c.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 14, width: 20 }}>{c.icon}</span>
                  <span style={{ color: isKey ? "#e2e8f0" : "#475569", fontSize: 12, flex: 1 }}>
                    {c.label}
                  </span>
                  {isKey && (
                    <span
                      style={{
                        fontSize: 9,
                        color: "#f59e0b",
                        background: "#f59e0b15",
                        borderRadius: 3,
                        padding: "1px 5px",
                        fontWeight: 700,
                      }}
                    >
                      KEY ×{wt.toFixed(1)}
                    </span>
                  )}
                  <div style={{ background: "#0b1526", borderRadius: 4, height: 6, width: 80 }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(wt / 1.5) * 100}%`,
                        background: isKey ? TYPE_COLORS[type] : "#1e3a5f",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Thresholds */}
        <div
          style={{
            background: "#06101e",
            border: "1px solid #1a2840",
            borderRadius: 10,
            padding: 20,
          }}
        >
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "#94a3b8",
              marginBottom: 12,
            }}
          >
            Score Thresholds
          </div>
          {[
            ["72%+", "#10b981", "Strong opportunity — pursue actively"],
            ["52–71%", "#f59e0b", "Conditional — dig deeper before committing"],
            ["< 52%", "#ef4444", "Weak fit — consider passing or low-ball"],
          ].map(([r, c, l]) => (
            <div
              key={r}
              style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}
            >
              <span style={{ color: c, fontWeight: 800, fontSize: 14, width: 52 }}>{r}</span>
              <div
                style={{ width: 6, height: 6, borderRadius: "50%", background: c, flexShrink: 0 }}
              />
              <span style={{ color: "#475569", fontSize: 12 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
