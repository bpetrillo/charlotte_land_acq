import { TYPE_COLORS, TYPE_ICONS, STATUS_COLORS, ZONING_CAT_COLORS } from "../constants";
import ZONING_CODES from "../data/zoningCodes";
import { weightedScore } from "../utils/scoring";
import { Pill, ScoreRing } from "./ui";

export default function SiteCard({ site, onSelect, selected }) {
  const score = weightedScore(site.scores, site.type);
  const tc = TYPE_COLORS[site.type];
  const zoningColor = ZONING_CODES[site.zoning]
    ? ZONING_CAT_COLORS[ZONING_CODES[site.zoning].category]
    : "#64748b";

  return (
    <div
      onClick={() => onSelect(site)}
      style={{
        background: selected ? "#101f38" : "#0b1526",
        border: `1px solid ${selected ? "#3b82f6" : "#1a2840"}`,
        borderLeft: `3px solid ${selected ? "#3b82f6" : tc}`,
        borderRadius: 9,
        padding: "12px 14px",
        cursor: "pointer",
        transition: "all 0.15s",
        marginBottom: 7,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
          {/* Name */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 13 }}>{TYPE_ICONS[site.type]}</span>
            <span
              style={{
                color: "#f1f5f9",
                fontWeight: 700,
                fontSize: 13,
                fontFamily: "'Syne', sans-serif",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {site.name}
            </span>
          </div>

          {/* Meta */}
          <div style={{ color: "#475569", fontSize: 11, marginBottom: 7 }}>
            {site.county} Co. · {site.acres} ac ·{" "}
            <span style={{ color: zoningColor, fontWeight: 600 }}>{site.zoning}</span>
          </div>

          {/* Pills */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
            <Pill color={STATUS_COLORS[site.status]}>{site.status}</Pill>
            <span style={{ color: "#64748b", fontSize: 11 }}>
              ${(site.askingPrice / 1e6).toFixed(2)}M
            </span>
          </div>
        </div>

        <ScoreRing pct={score} size={48} />
      </div>
    </div>
  );
}
