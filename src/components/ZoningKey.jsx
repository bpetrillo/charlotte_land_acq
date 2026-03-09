import { useState, useMemo } from "react";
import ZONING_CODES from "../data/zoningCodes";
import {
  SITE_TYPES,
  ZONING_CATEGORIES,
  ZONING_CAT_COLORS,
  TYPE_COLORS,
  TYPE_ICONS,
} from "../constants";

export default function ZoningKey() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = useMemo(() => {
    return Object.entries(ZONING_CODES).filter(([code, z]) => {
      if (catFilter !== "All" && z.category !== catFilter) return false;
      if (typeFilter !== "All" && !z.compatible.includes(typeFilter)) return false;
      const q = search.toLowerCase();
      if (
        q &&
        !code.toLowerCase().includes(q) &&
        !z.label.toLowerCase().includes(q) &&
        !z.description.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [search, catFilter, typeFilter]);

  const grouped = useMemo(() => {
    const g = {};
    ZONING_CATEGORIES.forEach((c) => {
      g[c] = [];
    });
    filtered.forEach(([code, z]) => {
      if (g[z.category]) g[z.category].push([code, z]);
    });
    return g;
  }, [filtered]);

  const selectStyle = {
    background: "#06101e",
    border: "1px solid #1a2840",
    borderRadius: 7,
    color: "#64748b",
    padding: "8px 12px",
    fontSize: 12,
    outline: "none",
  };

  return (
    <div
      style={{
        padding: "28px 32px",
        overflowY: "auto",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 780 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 20,
              color: "#f1f5f9",
              marginBottom: 6,
            }}
          >
            Zoning Code Reference
          </div>
          <div style={{ color: "#475569", fontSize: 13, lineHeight: 1.6 }}>
            Charlotte-Mecklenburg UDO codes plus common Union, Cabarrus, Iredell, and Gaston
            county designations. Filter by development type to see compatible zones.
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
          <input
            placeholder="🔍  Search code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: 200,
              background: "#06101e",
              border: "1px solid #1a2840",
              borderRadius: 7,
              color: "#f1f5f9",
              padding: "8px 11px",
              fontSize: 12,
              outline: "none",
            }}
          />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            style={selectStyle}
          >
            {["All Categories", ...ZONING_CATEGORIES].map((o) => (
              <option key={o} value={o === "All Categories" ? "All" : o}>
                {o}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={selectStyle}
          >
            {["All Dev Types", ...SITE_TYPES].map((o) => (
              <option key={o} value={o === "All Dev Types" ? "All" : o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Dev type legend */}
        <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
          {SITE_TYPES.map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: TYPE_COLORS[t] + "12",
                border: `1px solid ${TYPE_COLORS[t]}30`,
                borderRadius: 6,
                padding: "4px 10px",
              }}
            >
              <span style={{ fontSize: 13 }}>{TYPE_ICONS[t]}</span>
              <span style={{ color: TYPE_COLORS[t], fontSize: 11, fontWeight: 600 }}>
                {t} Compatible
              </span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#1a284010",
              border: "1px solid #1a2840",
              borderRadius: 6,
              padding: "4px 10px",
            }}
          >
            <span style={{ color: "#374151", fontSize: 11 }}>🚫 Not for residential/commercial dev</span>
          </div>
        </div>

        {/* Grouped tables */}
        {ZONING_CATEGORIES.map((cat) => {
          const rows = grouped[cat];
          if (!rows || rows.length === 0) return null;
          const cc = ZONING_CAT_COLORS[cat];

          return (
            <div
              key={cat}
              style={{
                background: "#06101e",
                border: "1px solid #1a2840",
                borderTop: `3px solid ${cc}`,
                borderRadius: 10,
                marginBottom: 16,
                overflow: "hidden",
              }}
            >
              {/* Category header */}
              <div
                style={{
                  padding: "12px 18px",
                  borderBottom: "1px solid #1a2840",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: cc }} />
                <span
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#e2e8f0",
                  }}
                >
                  {cat} Zones
                </span>
                <span style={{ color: "#1e3a5f", fontSize: 11 }}>
                  — {rows.length} code{rows.length !== 1 ? "s" : ""}
                </span>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a2840" }}>
                    {["Code", "Classification", "Description", "Dev Compatible"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 16px",
                          textAlign: "left",
                          color: "#1e3a5f",
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          fontWeight: 600,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([code, z], i) => (
                    <tr
                      key={code}
                      style={{
                        borderBottom: i < rows.length - 1 ? "1px solid #0d1a2e" : "none",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#0b1526")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "11px 16px", verticalAlign: "top" }}>
                        <span
                          style={{
                            background: cc + "18",
                            color: cc,
                            border: `1px solid ${cc}35`,
                            borderRadius: 5,
                            padding: "3px 9px",
                            fontSize: 12,
                            fontWeight: 800,
                            whiteSpace: "nowrap",
                            fontFamily: "'Syne', sans-serif",
                          }}
                        >
                          {code}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          color: "#cbd5e1",
                          fontSize: 12,
                          fontWeight: 600,
                          verticalAlign: "top",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {z.label}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          color: "#475569",
                          fontSize: 12,
                          lineHeight: 1.5,
                          verticalAlign: "top",
                        }}
                      >
                        {z.description}
                      </td>
                      <td style={{ padding: "11px 16px", verticalAlign: "top" }}>
                        {z.compatible.length > 0 ? (
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {z.compatible.map((t) => (
                              <span key={t} style={{ fontSize: 14 }}>
                                {TYPE_ICONS[t]}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "#1e3a5f", fontSize: 11 }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ color: "#1e3a5f", textAlign: "center", padding: 48, fontSize: 13 }}>
            No zoning codes match your search
          </div>
        )}

        <div style={{ color: "#1e3a5f", fontSize: 11, marginTop: 12, lineHeight: 1.7 }}>
          * Codes based on Charlotte-Mecklenburg UDO and common suburban county designations.
          Always verify current zoning with the applicable municipality before acquisition decisions.
        </div>
      </div>
    </div>
  );
}
