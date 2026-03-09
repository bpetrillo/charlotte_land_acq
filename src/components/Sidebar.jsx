import { SITE_TYPES, STATUSES, COUNTIES } from "../constants";
import SiteCard from "./SiteCard";

export default function Sidebar({ sorted, filters, setFilter, search, setSearch, selected, onSelect }) {
  return (
    <div
      style={{
        width: 315,
        background: "#06101e",
        borderRight: "1px solid #1a2840",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Filter bar */}
      <div style={{ padding: "12px 13px", borderBottom: "1px solid #1a2840" }}>
        <input
          placeholder="🔍  Search sites or addresses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            background: "#0b1526",
            border: "1px solid #1a2840",
            borderRadius: 7,
            color: "#f1f5f9",
            padding: "8px 10px",
            fontSize: 12,
            outline: "none",
            marginBottom: 8,
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            ["type", ["All Types", ...SITE_TYPES]],
            ["status", ["All Statuses", ...STATUSES]],
            ["county", ["All Counties", ...COUNTIES]],
          ].map(([key, opts]) => (
            <select
              key={key}
              value={filters[key] === "All" ? opts[0] : filters[key]}
              onChange={(e) =>
                setFilter(key, e.target.value === opts[0] ? "All" : e.target.value)
              }
              style={{
                background: "#0b1526",
                border: "1px solid #1a2840",
                borderRadius: 6,
                color: "#64748b",
                padding: "6px 7px",
                fontSize: 11,
                outline: "none",
                gridColumn: key === "county" ? "span 2" : "span 1",
              }}
            >
              {opts.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ))}
        </div>

        {/* Min score slider */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <span style={{ color: "#1e3a5f", fontSize: 10, whiteSpace: "nowrap" }}>Min score</span>
          <input
            type="range"
            min={0}
            max={100}
            value={filters.minScore}
            onChange={(e) => setFilter("minScore", +e.target.value)}
            style={{ flex: 1, accentColor: "#3b82f6" }}
          />
          <span style={{ color: "#475569", fontSize: 11, width: 28 }}>{filters.minScore}%</span>
        </div>
      </div>

      {/* Site list */}
      <div style={{ overflowY: "auto", padding: "10px 11px", flex: 1 }}>
        <div
          style={{
            color: "#1e3a5f",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          {sorted.length} site{sorted.length !== 1 ? "s" : ""} · by score
        </div>

        {sorted.map((s) => (
          <SiteCard key={s.id} site={s} onSelect={onSelect} selected={selected?.id === s.id} />
        ))}

        {sorted.length === 0 && (
          <div style={{ color: "#1a2840", textAlign: "center", padding: 40, fontSize: 12 }}>
            No sites match filters
          </div>
        )}
      </div>
    </div>
  );
}
