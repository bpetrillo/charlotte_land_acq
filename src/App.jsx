import { useState } from "react";
import { SITE_TYPES, TYPE_COLORS, TYPE_ICONS, STATUS_COLORS } from "./constants";
import { useSites } from "./hooks/useSites";
import { useFilters } from "./hooks/useFilters";
import Sidebar from "./components/Sidebar";
import SiteDetail from "./components/SiteDetail";
import PipelineView from "./components/PipelineView";
import ZoningKey from "./components/ZoningKey";
import ScoreGuide from "./components/ScoreGuide";
import AddSiteModal from "./components/AddSiteModal";
import ParcelSearch from "./components/ParcelSearch";

const VIEWS = [
  { id: "sites",    label: "📋 Sites" },
  { id: "pipeline", label: "🔄 Pipeline" },
  { id: "import",   label: "🛰️ Auto-Import" },
  { id: "zoning",   label: "🗂️ Zoning Key" },
  { id: "scoring",  label: "⚡ Score Guide" },
];

export default function App() {
  const { sites, addSite, updateStatus, stats } = useSites();
  const { filters, setFilter, search, setSearch, sorted } = useFilters(sites);

  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("sites");
  const [showAdd, setShowAdd] = useState(false);

  const handleImportParcels = (prospects) => {
    prospects.forEach((p) => addSite(p));
    setView("sites");
  };

  const handleStatusChange = (id, status) => {
    updateStatus(id, status);
    setSelected((sel) => (sel?.id === id ? { ...sel, status } : sel));
  };

  const handleAddSave = (site) => {
    addSite(site);
    setShowAdd(false);
  };

  const showSidebar = view === "sites" || view === "pipeline";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#040c18", minHeight: "100vh", color: "#f1f5f9" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* ── Top Nav ─────────────────────────────────────────────────── */}
      <nav
        style={{
          background: "#06101e",
          borderBottom: "1px solid #1a2840",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              borderRadius: 8,
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            📍
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: "#f1f5f9" }}>
            LandTrack
          </span>
          <span style={{ color: "#1e3a5f", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>
            Charlotte Metro
          </span>
        </div>

        {/* Nav buttons */}
        <div style={{ display: "flex", gap: 6 }}>
          {VIEWS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              style={{
                background: view === id ? "#1d4ed822" : "none",
                border: `1px solid ${view === id ? "#3b82f6" : "#1a2840"}`,
                color: view === id ? "#3b82f6" : "#475569",
                borderRadius: 7,
                padding: "5px 13px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setShowAdd(true)}
            style={{
              background: "#1d4ed8",
              border: "none",
              color: "#fff",
              borderRadius: 7,
              padding: "5px 15px",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            + Log Site
          </button>
        </div>
      </nav>

      {/* ── Stats Bar ────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#06101e",
          borderBottom: "1px solid #1a2840",
          padding: "10px 20px",
          display: "flex",
          gap: 28,
          alignItems: "center",
        }}
      >
        {[
          ["Active Sites", stats.active, "#3b82f6"],
          ["Pipeline Value", "$" + stats.totalValue + "M", "#10b981"],
          ["Total Acres", stats.totalAcres + " ac", "#f59e0b"],
          ["Avg Score", stats.avgScore + "%", stats.avgScore >= 70 ? "#10b981" : "#f59e0b"],
        ].map(([l, v, c]) => (
          <div key={l}>
            <div style={{ color: c, fontWeight: 800, fontSize: 17 }}>{v}</div>
            <div style={{ color: "#1e3a5f", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>
              {l}
            </div>
          </div>
        ))}

        {/* Type breakdown */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
          {SITE_TYPES.map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: TYPE_COLORS[t] }} />
              <span style={{ color: "#374151", fontSize: 11 }}>
                {sites.filter((s) => s.type === t && !["Dead", "Closed"].includes(s.status)).length}{" "}
                {t}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", height: "calc(100vh - 112px)", overflow: "hidden" }}>
        {/* Sidebar (Sites + Pipeline views) */}
        {showSidebar && (
          <Sidebar
            sorted={sorted}
            filters={filters}
            setFilter={setFilter}
            search={search}
            setSearch={setSearch}
            selected={selected}
            onSelect={setSelected}
          />
        )}

        {/* Content pane */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

          {/* Sites overview */}
          {view === "sites" && (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "radial-gradient(ellipse at 35% 35%, #0d1f3c 0%, #040c18 65%)",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🗺️</div>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    color: "#1d4ed8",
                    fontSize: 13,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Charlotte Metro
                </div>
                <div style={{ color: "#1e3a5f", fontSize: 12 }}>
                  Select a site from the left panel to view full details
                </div>
              </div>

              {/* Top site cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, maxWidth: 520 }}>
                {sorted.slice(0, 6).map((s) => {
                  const { weightedScore } = require("./utils/scoring");
                  const sc = weightedScore(s.scores, s.type);
                  const tc = TYPE_COLORS[s.type];
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelected(s)}
                      style={{
                        background: "#06101e",
                        border: "1px solid #1a2840",
                        borderTop: `2px solid ${tc}`,
                        borderRadius: 9,
                        padding: "12px 14px",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{TYPE_ICONS[s.type]}</div>
                      <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 12, marginBottom: 3 }}>
                        {s.name}
                      </div>
                      <div style={{ color: "#1e3a5f", fontSize: 10, marginBottom: 6 }}>
                        {s.acres} ac · {s.county}
                      </div>
                      <div
                        style={{
                          color: sc >= 72 ? "#10b981" : sc >= 52 ? "#f59e0b" : "#ef4444",
                          fontWeight: 800,
                          fontSize: 14,
                        }}
                      >
                        {sc}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "pipeline" && (
            <PipelineView sorted={sorted} onSelect={setSelected} />
          )}
          {view === "import" && <ParcelSearch onImport={handleImportParcels} />}
          {view === "zoning" && <ZoningKey />}
          {view === "scoring" && <ScoreGuide />}

          {/* Detail panel */}
          {selected && (
            <SiteDetail
              site={selected}
              onClose={() => setSelected(null)}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <AddSiteModal onSave={handleAddSave} onClose={() => setShowAdd(false)} />
      )}
    </div>
  );
}
