import { useState } from "react";
import { SITE_TYPES, COUNTIES, TYPE_COLORS, TYPE_ICONS } from "../constants.js";
import { searchAllSources } from "../services/parcelService.js";

const MIN_ACRES_OPTIONS = [1, 2, 5, 10, 20, 50];

const DATA_SOURCES = [
  {
    id: "mecklenburg",
    name: "Mecklenburg County GIS",
    description: "Official county parcel database. Free, no key required.",
    status: "free",
    url: "https://maps.mecknc.gov",
    counties: ["Mecklenburg"],
  },
  {
    id: "regrid",
    name: "Regrid",
    description: "Nationwide parcel data. Free tier: 1,000 requests/month.",
    status: "key-required",
    url: "https://regrid.com/api",
    counties: ["All"],
    envKey: "VITE_REGRID_API_KEY",
  },
  {
    id: "attom",
    name: "ATTOM Data",
    description: "Property intelligence with ownership + sales history. Free trial available.",
    status: "key-required",
    url: "https://api.attomdata.com",
    counties: ["All"],
    envKey: "VITE_ATTOM_API_KEY",
  },
];

export default function ParcelSearch({ onImport }) {
  const [form, setForm] = useState({
    county: COUNTIES[0],
    devType: SITE_TYPES[0],
    minAcres: 5,
    zoning: "",
    vacantOnly: true,
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setSelected(new Set());
    try {
      const parcels = await searchAllSources({
        county: form.county,
        devType: form.devType,
        minAcres: form.minAcres,
        zoning: form.zoning || undefined,
        vacantOnly: form.vacantOnly,
      });
      setResults(parcels);
      if (parcels.length === 0) setError("No parcels found for these criteria. Try relaxing filters.");
    } catch (e) {
      setError("Search failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === results.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(results.map((r) => r.id)));
    }
  };

  const handleImport = () => {
    const toImport = results.filter((r) => selected.has(r.id));
    onImport(toImport);
    setResults(null);
    setSelected(new Set());
  };

  const tc = TYPE_COLORS[form.devType];

  const inputStyle = {
    background: "#0b1526",
    border: "1px solid #1a2840",
    borderRadius: 7,
    color: "#f1f5f9",
    padding: "8px 10px",
    fontSize: 13,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 760 }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#f1f5f9", marginBottom: 6 }}>
            Auto-Import Land Prospects
          </div>
          <div style={{ color: "#475569", fontSize: 13, lineHeight: 1.7 }}>
            Search public parcel databases for development-ready land. Results are auto-scored and imported as prospects into your pipeline. You still review and confirm before they're added.
          </div>
        </div>

        {/* Data source status */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
          {DATA_SOURCES.map((src) => {
            const hasKey = src.status === "free" || (src.envKey && import.meta.env[src.envKey]);
            return (
              <div key={src.id} style={{ background: "#06101e", border: `1px solid ${hasKey ? "#10b98130" : "#1a2840"}`, borderTop: `3px solid ${hasKey ? "#10b981" : "#374151"}`, borderRadius: 10, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 12, fontFamily: "'Syne', sans-serif" }}>{src.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: hasKey ? "#10b98118" : "#37415118", color: hasKey ? "#10b981" : "#64748b" }}>
                    {hasKey ? "✓ Ready" : "Key needed"}
                  </span>
                </div>
                <div style={{ color: "#475569", fontSize: 11, lineHeight: 1.5, marginBottom: 8 }}>{src.description}</div>
                {!hasKey && src.envKey && (
                  <div style={{ background: "#0b1526", borderRadius: 5, padding: "5px 8px", fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>
                    Add {src.envKey} to .env
                  </div>
                )}
                {src.status === "free" && (
                  <div style={{ color: "#10b981", fontSize: 10, fontWeight: 600 }}>No API key needed</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Search form */}
        <div style={{ background: "#06101e", border: "1px solid #1a2840", borderRadius: 12, padding: 22, marginBottom: 24 }}>
          <div style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Search Parameters</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>County</label>
              <select value={form.county} onChange={(e) => set("county", e.target.value)} style={{ ...inputStyle, marginTop: 4 }}>
                {COUNTIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Development Type</label>
              <select value={form.devType} onChange={(e) => set("devType", e.target.value)} style={{ ...inputStyle, marginTop: 4 }}>
                {SITE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Min Acreage</label>
              <select value={form.minAcres} onChange={(e) => set("minAcres", +e.target.value)} style={{ ...inputStyle, marginTop: 4 }}>
                {MIN_ACRES_OPTIONS.map((n) => <option key={n} value={n}>{n}+ acres</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Zoning Filter (optional)</label>
              <input placeholder="e.g. R-20, B-2" value={form.zoning} onChange={(e) => set("zoning", e.target.value)} style={{ ...inputStyle, marginTop: 4 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 22 }}>
              <input type="checkbox" id="vacantOnly" checked={form.vacantOnly} onChange={(e) => set("vacantOnly", e.target.checked)} style={{ accentColor: "#3b82f6", width: 14, height: 14 }} />
              <label htmlFor="vacantOnly" style={{ color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>Vacant / unimproved land only</label>
            </div>
          </div>

          <button onClick={handleSearch} disabled={loading} style={{ background: loading ? "#1a2840" : "#1d4ed8", border: "none", color: loading ? "#475569" : "#fff", borderRadius: 8, padding: "10px 24px", cursor: loading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            {loading ? (
              <>
                <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid #475569", borderTopColor: "#94a3b8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Searching public databases...
              </>
            ) : "🔍  Search Parcels"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#ef444415", border: "1px solid #ef444430", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#ef4444", fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <span style={{ color: "#f1f5f9", fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{results.length} parcels found</span>
                <span style={{ color: "#475569", fontSize: 12, marginLeft: 8 }}>· {selected.size} selected</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={toggleAll} style={{ background: "#0b1526", border: "1px solid #1a2840", color: "#94a3b8", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>
                  {selected.size === results.length ? "Deselect All" : "Select All"}
                </button>
                {selected.size > 0 && (
                  <button onClick={handleImport} style={{ background: "#1d4ed8", border: "none", color: "#fff", borderRadius: 6, padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                    Import {selected.size} Site{selected.size !== 1 ? "s" : ""} →
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {results.map((p) => {
                const isSelected = selected.has(p.id);
                const score = Math.round(
                  Object.values(p.scores).reduce((a, b) => a + b, 0) / Object.keys(p.scores).length / 5 * 100
                );
                const scoreColor = score >= 72 ? "#10b981" : score >= 52 ? "#f59e0b" : "#ef4444";

                return (
                  <div key={p.id} onClick={() => toggleSelect(p.id)} style={{ background: isSelected ? "#101f38" : "#06101e", border: `1px solid ${isSelected ? "#3b82f6" : "#1a2840"}`, borderLeft: `3px solid ${isSelected ? "#3b82f6" : tc}`, borderRadius: 9, padding: "12px 16px", cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div style={{ width: 14, height: 14, borderRadius: 3, border: `2px solid ${isSelected ? "#3b82f6" : "#1a2840"}`, background: isSelected ? "#3b82f6" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", flexShrink: 0 }}>
                            {isSelected && "✓"}
                          </div>
                          <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13, fontFamily: "'Syne', sans-serif" }}>{p.name}</span>
                          <span style={{ fontSize: 9, color: "#475569", background: "#1a2840", borderRadius: 3, padding: "1px 6px" }}>{p.dataSource}</span>
                          {p.scores.zoning >= 4 && <span style={{ fontSize: 9, color: "#10b981", background: "#10b98115", borderRadius: 3, padding: "1px 6px" }}>✓ Zoning Match</span>}
                          {p.isAutoImported && p.scores.utilities <= 2 && <span style={{ fontSize: 9, color: "#f59e0b", background: "#f59e0b15", borderRadius: 3, padding: "1px 6px" }}>⚠ Utilities TBD</span>}
                        </div>
                        <div style={{ color: "#475569", fontSize: 11, marginBottom: 6, paddingLeft: 22 }}>{p.address}</div>
                        <div style={{ display: "flex", gap: 14, paddingLeft: 22 }}>
                          <span style={{ color: "#64748b", fontSize: 11 }}>{p.acres} ac</span>
                          <span style={{ color: "#64748b", fontSize: 11 }}>Zoning: <span style={{ color: "#94a3b8" }}>{p.zoning || "—"}</span></span>
                          <span style={{ color: "#64748b", fontSize: 11 }}>Owner: <span style={{ color: "#94a3b8" }}>{p.contact}</span></span>
                          {p.askingPrice > 0 && (
                            <span style={{ color: "#64748b", fontSize: 11 }}>Assessed: <span style={{ color: "#94a3b8" }}>${(p.askingPrice / 1000).toFixed(0)}K</span></span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                        <div style={{ color: scoreColor, fontWeight: 800, fontSize: 16 }}>{score}%</div>
                        <div style={{ color: "#1e3a5f", fontSize: 10 }}>auto-score</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* How it works */}
        {!results && !loading && (
          <div style={{ background: "#06101e", border: "1px solid #1a2840", borderRadius: 12, padding: 24 }}>
            <div style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>How Auto-Import Works</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["🔍", "Search", "Query public GIS + parcel APIs for land matching your criteria — county, min acreage, zoning, and vacancy status."],
                ["🤖", "Auto-Score", "Each result gets an initial weighted score based on acreage, zoning compatibility, and vacancy. Roads/schools default to neutral until you verify."],
                ["✅", "Review & Import", "You see all results, select the ones worth pursuing, and import them as Prospects into your pipeline. Nothing enters your pipeline without your approval."],
                ["✏️", "Refine", "Once imported, update the criteria scores and add field notes as you investigate each parcel."],
              ].map(([icon, step, desc]) => (
                <div key={step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 20, width: 28, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{step}</div>
                    <div style={{ color: "#475569", fontSize: 12, lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, padding: "12px 14px", background: "#0b1526", borderRadius: 8, border: "1px solid #1a2840" }}>
              <div style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>💡 Coming Soon / Integration Ideas</div>
              <div style={{ color: "#475569", fontSize: 11, lineHeight: 1.8 }}>
                • CoStar / LoopNet listing feed (commercial)<br />
                • Zillow/Realtor.com vacant land listings<br />
                • NC Secretary of State corporate dissolution filings (motivated sellers)<br />
                • Tax delinquent parcel alerts from county tax offices<br />
                • FEMA flood zone overlay for instant risk flag
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
