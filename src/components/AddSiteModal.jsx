import { useState } from "react";
import { SITE_TYPES, STATUSES, COUNTIES, CRITERIA, WEIGHTS } from "../constants";
import { weightedScore } from "../utils/scoring";

const BLANK = {
  name: "",
  county: COUNTIES[0],
  type: SITE_TYPES[0],
  status: STATUSES[0],
  acres: "",
  askingPrice: "",
  address: "",
  zoning: "",
  contact: "",
  phone: "",
  notes: "",
  priority: "Medium",
  scores: { acreage: 3, zoning: 3, roads: 3, utilities: 3, schools: 3, competition: 3 },
};

export default function AddSiteModal({ onSave, onClose }) {
  const [form, setForm] = useState(BLANK);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setScore = (k, v) => setForm((f) => ({ ...f, scores: { ...f.scores, [k]: v } }));

  const preview = weightedScore(form.scores, form.type);
  const previewColor =
    preview >= 72 ? "#10b981" : preview >= 52 ? "#f59e0b" : "#ef4444";
  const w = WEIGHTS[form.type];

  const handleSave = () => {
    if (!form.name.trim()) {
      alert("Site name is required");
      return;
    }
    onSave(form);
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    marginTop: 4,
    background: "#0b1526",
    border: "1px solid #1a2840",
    borderRadius: 7,
    color: "#f1f5f9",
    padding: "8px 10px",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#00000099",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#080f1e",
          border: "1px solid #1a2840",
          borderRadius: 14,
          padding: 28,
          width: 560,
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
          }}
        >
          <span
            style={{
              color: "#f1f5f9",
              fontWeight: 800,
              fontSize: 17,
              fontFamily: "'Syne', sans-serif",
            }}
          >
            Log New Site
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#475569",
              cursor: "pointer",
              fontSize: 20,
            }}
          >
            ✕
          </button>
        </div>

        {/* Text fields */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}
        >
          {[
            ["Site Name *", "name", "text", "span 2"],
            ["Street Address", "address", "text", "span 2"],
            ["Acres", "acres", "number", "span 1"],
            ["Asking Price ($)", "askingPrice", "number", "span 1"],
            ["Zoning", "zoning", "text", "span 1"],
            ["Contact Name", "contact", "text", "span 1"],
            ["Phone", "phone", "tel", "span 1"],
          ].map(([label, key, type, col]) => (
            <div key={key} style={{ gridColumn: col }}>
              <label style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                style={inputStyle}
              />
            </div>
          ))}

          {/* Dropdowns */}
          {[
            ["Site Type", "type", SITE_TYPES],
            ["County", "county", COUNTIES],
            ["Status", "status", STATUSES],
            ["Priority", "priority", ["High", "Medium", "Low"]],
          ].map(([label, key, opts]) => (
            <div key={key}>
              <label style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                {label}
              </label>
              <select
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                style={{ ...inputStyle, display: "block" }}
              >
                {opts.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Score inputs */}
        <div
          style={{
            background: "#0b1526",
            border: "1px solid #1a2840",
            borderRadius: 10,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>
              Score Each Criterion
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#475569", fontSize: 11 }}>Live score:</span>
              <span style={{ color: previewColor, fontWeight: 800, fontSize: 15 }}>{preview}%</span>
            </div>
          </div>

          {CRITERIA.map((c) => (
            <div
              key={c.key}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13 }}>{c.icon}</span>
                <span style={{ color: "#94a3b8", fontSize: 12 }}>{c.label}</span>
                {w[c.key] > 1.2 && (
                  <span
                    style={{
                      fontSize: 9,
                      color: "#f59e0b",
                      background: "#f59e0b15",
                      borderRadius: 3,
                      padding: "1px 4px",
                    }}
                  >
                    KEY
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    onClick={() => setScore(c.key, i)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 5,
                      border: "1px solid",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 11,
                      transition: "all 0.1s",
                      borderColor: i <= form.scores[c.key] ? "#3b82f6" : "#1a2840",
                      background: i <= form.scores[c.key] ? "#3b82f622" : "#080f1e",
                      color: i <= form.scores[c.key] ? "#3b82f6" : "#374151",
                    }}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
            Field Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              background: "#0b1526",
              border: "1px solid #1a2840",
              color: "#64748b",
              borderRadius: 8,
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              background: "#1d4ed8",
              border: "none",
              color: "#fff",
              borderRadius: 8,
              padding: "10px 22px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Log Site
          </button>
        </div>
      </div>
    </div>
  );
}
