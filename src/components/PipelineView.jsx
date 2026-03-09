import { STATUSES, STATUS_COLORS, TYPE_COLORS, TYPE_ICONS } from "../constants";
import { weightedScore, scoreColor } from "../utils/scoring";

export default function PipelineView({ sorted, onSelect }) {
  return (
    <div
      style={{
        padding: "18px 20px",
        overflowX: "auto",
        overflowY: "hidden",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          minWidth: "max-content",
          alignItems: "flex-start",
        }}
      >
        {STATUSES.map((status) => {
          const cols = sorted.filter((s) => s.status === status);
          const totalVal = cols.reduce((a, s) => a + s.askingPrice, 0);

          return (
            <div key={status} style={{ width: 195, flexShrink: 0 }}>
              {/* Column header */}
              <div
                style={{
                  background: STATUS_COLORS[status] + "12",
                  border: `1px solid ${STATUS_COLORS[status]}25`,
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: STATUS_COLORS[status], fontWeight: 700, fontSize: 12 }}>
                    {status}
                  </span>
                  <span
                    style={{
                      background: STATUS_COLORS[status] + "25",
                      color: STATUS_COLORS[status],
                      borderRadius: "50%",
                      width: 18,
                      height: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {cols.length}
                  </span>
                </div>
                {totalVal > 0 && (
                  <div style={{ color: STATUS_COLORS[status] + "80", fontSize: 10, marginTop: 2 }}>
                    ${(totalVal / 1e6).toFixed(1)}M
                  </div>
                )}
              </div>

              {/* Cards */}
              <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 220px)" }}>
                {cols.map((s) => {
                  const sc = weightedScore(s.scores, s.type);
                  return (
                    <div
                      key={s.id}
                      onClick={() => onSelect(s)}
                      style={{
                        background: "#06101e",
                        border: "1px solid #1a2840",
                        borderLeft: `3px solid ${TYPE_COLORS[s.type]}`,
                        borderRadius: 8,
                        padding: "10px 12px",
                        marginBottom: 7,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 3,
                        }}
                      >
                        <span style={{ fontSize: 13 }}>{TYPE_ICONS[s.type]}</span>
                        <span
                          style={{
                            color: scoreColor(sc),
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {sc}%
                        </span>
                      </div>
                      <div
                        style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 12, marginBottom: 2 }}
                      >
                        {s.name}
                      </div>
                      <div style={{ color: "#1e3a5f", fontSize: 10 }}>
                        {s.acres} ac · ${(s.askingPrice / 1e6).toFixed(2)}M
                      </div>
                    </div>
                  );
                })}
                {cols.length === 0 && (
                  <div style={{ color: "#1a2840", fontSize: 11, textAlign: "center", paddingTop: 16 }}>
                    —
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
