export const SITE_TYPES = ["Residential", "Multifamily", "Commercial"];

export const STATUSES = [
  "Prospect",
  "Under Review",
  "LOI Submitted",
  "Under Contract",
  "Closed",
  "Dead",
];

export const COUNTIES = [
  "Mecklenburg",
  "Union",
  "Cabarrus",
  "Gaston",
  "Iredell",
  "York (SC)",
  "Lancaster (SC)",
];

export const STATUS_COLORS = {
  Prospect: "#64748b",
  "Under Review": "#3b82f6",
  "LOI Submitted": "#f59e0b",
  "Under Contract": "#8b5cf6",
  Closed: "#10b981",
  Dead: "#ef4444",
};

export const TYPE_COLORS = {
  Residential: "#10b981",
  Multifamily: "#3b82f6",
  Commercial: "#f59e0b",
};

export const TYPE_ICONS = {
  Residential: "🏡",
  Multifamily: "🏢",
  Commercial: "🏪",
};

export const CRITERIA = [
  { key: "acreage",     label: "Parcel Size / Acreage",         icon: "📐" },
  { key: "zoning",      label: "Zoning Classification",          icon: "🏛️" },
  { key: "roads",       label: "Proximity to Highways / Roads",  icon: "🛣️" },
  { key: "utilities",   label: "Utilities Availability",         icon: "⚡" },
  { key: "schools",     label: "School District Quality",        icon: "🎓" },
  { key: "competition", label: "Low Competitor Activity",        icon: "🔭" },
];

export const WEIGHTS = {
  Residential: { acreage: 1.2, zoning: 1.1, roads: 0.9, utilities: 1.0, schools: 1.5, competition: 1.0 },
  Multifamily: { acreage: 1.0, zoning: 1.2, roads: 1.3, utilities: 1.2, schools: 0.8, competition: 1.1 },
  Commercial:  { acreage: 0.9, zoning: 1.3, roads: 1.5, utilities: 1.1, schools: 0.5, competition: 1.3 },
};

export const ZONING_CATEGORIES = ["Residential", "Mixed Use", "Commercial", "Industrial"];

export const ZONING_CAT_COLORS = {
  Residential: "#10b981",
  "Mixed Use": "#8b5cf6",
  Commercial: "#f59e0b",
  Industrial: "#64748b",
};
