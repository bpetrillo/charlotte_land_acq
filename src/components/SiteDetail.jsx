import {
  TYPE_COLORS,
  TYPE_ICONS,
  STATUS_COLORS,
  STATUSES,
  CRITERIA,
  WEIGHTS,
  ZONING_CAT_COLORS,
} from "../constants";
import ZONING_CODES from "../data/zoningCodes";
import { weightedScore } from "../utils/scoring";
import { Pill, ScoreRing, ScoreBar } from "./ui";

export default function SiteDetail({ site, onClose, onStatusChange }) {
  const score = weightedScore(site.scores, site.type);
  const tc = TYPE_COLORS[site.type];
  const w = WEIGHTS[site.type];
  const zoningInfo = ZONING_CODES[site.zoning];
  const zoningColor = zoningInfo
    ? ZONING_CAT_COLORS[zoningInfo.category]
    : "#64748b";

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 360,
        height: "100%",
        background: "#080f1e",
        borderLeft: "1px solid #1a2840",
        overflowY: "auto",
        zIndex: 10,
        boxShadow: "-8px 0 32px #00000066",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px 12px",
          borderBottom: "1px solid #1a2840",
          position: "sticky",
          top: 0,
          background: "#080f1e",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                background: tc + "22",
                borderRadius: 8,
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                flexShrink: 0,
              }}
            >
              {TYPE_ICONS[site.type]}
            </div>
            <div>
              <div
                style={{
                  color: "#f1f5f9",
                  fontWeight: 800,
                  fontSize: 15,
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                {site.name}
              </div>
              <div style={{ color: "#374151", fontSize: 11, marginTop: 1 }}>{site.address}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#374151",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {/* Status pills */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          <Pill color={STATUS_COLORS[site.status]}>{site.status}</Pill>
          <Pill color={tc}>{site.type}</Pill>
          <Pill color={site.priority === "High" ? "#ef4444" : "#64748b"}>
            {site.priority} Priority
          </Pill>
        </div>

        {/* Score ring */}
        <div
          style={{
            background: "#0b1526",
            borderRadius: 10,
            padding: "14px 16px",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 14,
            border: "1px solid #1a2840",
          }}
        >
          <ScoreRing pct={score} size={64} />
          <div>
            <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 2 }}>Weighted Site Score</div>
            <div style={{ color: "#475569", fontSize: 11, lineHeight: 1.5 }}>
              Criteria weighted for
              <br />
              <span style={{ color: tc, fontWeight: 600 }}>{site.type}</span> development
            </div>
          </div>
        </div>

        {/* Key stats grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}
        >
          {[
            ["Acreage", site.acres + " ac"],
            ["Ask Price", "$" + (site.askingPrice / 1e6).toFixed(2) + "M"],
            ["Per Acre", "$" + Math.round(site.askingPrice / site.acres / 1000) + "K"],
            ["County", site.county],
            ["Added", site.dateAdded],
          ].map(([l, v]) => (
            <div
              key={l}
              style={{
                background: "#0b1526",
                borderRadius: 7,
                padding: "9px 10px",
                border: "1px solid #1a2840",
              }}
            >
              <div
                style={{
                  color: "#1e3a5f",
                  fontSize: 9,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 3,
                }}
              >
                {l}
              </div>
              <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Zoning expanded */}
        <div
          style={{
            background: "#0b1526",
            borderRadius: 7,
            padding: "11px 12px",
            border: "1px solid #1a2840",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              color: "#1e3a5f",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            Zoning
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span
              style={{
                background: zoningColor + "18",
                color: zoningColor,
                border: `1px solid ${zoningColor}35`,
                borderRadius: 5,
                padding: "2px 9px",
                fontSize: 13,
                fontWeight: 800,
                fontFamily: "'Syne', sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {site.zoning}
            </span>
            <div>
              {zoningInfo ? (
                <>
                  <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
                    {zoningInfo.label}
                  </div>
                  <div style={{ color: "#475569", fontSize: 11, lineHeight: 1.5 }}>
                    {zoningInfo.description}
                  </div>
                </>
              ) : (
                <div style={{ color: "#374151", fontSize: 11 }}>
                  Code not in reference — verify with municipality
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Criteria scores */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              color: "#1e3a5f",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              marginBottom: 10,
            }}
          >
            Criteria Scores
          </div>
          {CRITERIA.map((c) => (
            <ScoreBar
              key={c.key}
              label={c.label}
              icon={c.icon}
              score={site.scores[c.key]}
              isKey={w[c.key] > 1.2}
            />
          ))}
        </div>

        {/* Field notes */}
        {site.notes && (
          <div
            style={{
              background: "#0b1526",
              border: "1px solid #1a2840",
              borderRadius: 8,
              padding: 14,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                color: "#1e3a5f",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              Field Notes
            </div>
            <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.7 }}>{site.notes}</div>
          </div>
        )}

        {/* Contact */}
        <div
          style={{
            background: "#0b1526",
            border: "1px solid #1a2840",
            borderRadius: 8,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              color: "#1e3a5f",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            Contact
          </div>
          <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{site.contact}</div>
          <div style={{ color: "#3b82f6", fontSize: 12, marginTop: 3 }}>{site.phone}</div>
        </div>

        {/* Status updater */}
        <div>
          <div
            style={{
              color: "#1e3a5f",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            Update Status
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(site.id, s)}
                style={{
                  background: site.status === s ? STATUS_COLORS[s] + "22" : "#0b1526",
                  border: `1px solid ${site.status === s ? STATUS_COLORS[s] : "#1a2840"}`,
                  color: site.status === s ? STATUS_COLORS[s] : "#374151",
                  borderRadius: 6,
                  padding: "5px 10px",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
