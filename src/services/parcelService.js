/**
 * parcelService.js — Charlotte Metro parcel search
 *
 * Data source: NC OneMap Statewide Parcel Layer (MapServer)
 * URL: https://services.nconemap.gov/secure/rest/services/NC1Map_Parcels/MapServer/1
 * No authentication required — public queryable endpoint.
 *
 * ArcGIS token still used for Living Atlas fallback if configured.
 * .env variables (optional):
 *   VITE_ARCGIS_CLIENT_ID=your_client_id
 *   VITE_ARCGIS_CLIENT_SECRET=your_client_secret
 */

// ─── ArcGIS Token (optional, for Living Atlas) ────────────────────────────────
let _tokenCache = null;

export async function getArcGISToken() {
  const clientId     = import.meta.env.VITE_ARCGIS_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_ARCGIS_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 120_000) return _tokenCache.token;

  try {
    const res = await fetch("https://www.arcgis.com/sharing/rest/oauth2/token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId, client_secret: clientSecret,
        grant_type: "client_credentials", f: "json",
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(JSON.stringify(data.error));
    _tokenCache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
    console.log("✓ ArcGIS token acquired");
    return _tokenCache.token;
  } catch (err) {
    console.warn("ArcGIS token failed:", err.message);
    return null;
  }
}

// ─── NC OneMap Statewide Parcel Layer ─────────────────────────────────────────
// Public MapServer — no token required. Covers all 100 NC counties.
// Fields confirmed from live API response.
const NC_PARCEL_URL =
  "https://services.nconemap.gov/secure/rest/services/NC1Map_Parcels/MapServer/1/query";

const COUNTY_NAMES = {
  Mecklenburg: "Mecklenburg",
  Cabarrus:    "Cabarrus",
  Union:       "Union",
  Iredell:     "Iredell",
  Gaston:      "Gaston",
  Rowan:       "Rowan",
  Lincoln:     "Lincoln",
};

export async function searchNCParcels({ county, minAcres, vacantOnly } = {}) {
  const whereParts = ["1=1"];

  if (county && COUNTY_NAMES[county]) {
    whereParts.push(`cntyname = '${COUNTY_NAMES[county]}'`);
  }
  if (minAcres)   whereParts.push(`gisacres >= ${minAcres}`);
  if (vacantOnly) whereParts.push(`structyear IS NULL`);

  const params = new URLSearchParams({
    where:             whereParts.join(" AND "),
    outFields:         "parno,ownname,siteadd,scity,gisacres,landval,parval,cntyname,structyear,parusedesc",
    returnGeometry:    false,
    f:                 "json",
    resultRecordCount: 50,
  });

  try {
    const res  = await fetch(`${NC_PARCEL_URL}?${params}`);
    const data = await res.json();

    if (data.error) {
      console.error("NC OneMap error:", data.error.message);
      return [];
    }

    const features = data.features?.filter((f) =>
      f.attributes?.ownname && f.attributes?.siteadd
    ) ?? [];

    console.log(`✓ NC OneMap returned ${features.length} parcels for ${county}`);
    return features.map((f) => normalizeNCParcel(f.attributes));
  } catch (err) {
    console.error("NC OneMap fetch failed:", err.message);
    return [];
  }
}

function normalizeNCParcel(a) {
  return {
    parcelId:    a.parno ?? String(Math.random()),
    source:      "NC OneMap",
    county:      a.cntyname ?? "",
    owner:       a.ownname  ?? "Unknown",
    address:     [a.siteadd, a.scity, "NC"].filter(Boolean).join(", "),
    acres:       parseFloat(a.gisacres) || 0,
    zoning:      "",  // Not in this layer — will show blank
    landValue:   a.landval  ?? 0,
    totalValue:  a.parval   ?? 0,
    yearBuilt:   a.structyear ?? null,
    isVacant:    !a.structyear,
    lastUpdated: new Date().toISOString().split("T")[0],
  };
}

// ─── Auto-score ───────────────────────────────────────────────────────────────
export function autoScoreParcel(parcel, devType = "Residential") {
  return {
    acreage:     scoreAcreage(parcel.acres, devType),
    zoning:      3, // Not available in this layer — neutral default
    roads:       3,
    utilities:   parcel.isVacant ? 2 : 4,
    schools:     3,
    competition: 3,
  };
}

function scoreAcreage(acres, devType) {
  if (devType === "Residential") {
    if (acres >= 50) return 5; if (acres >= 20) return 4;
    if (acres >= 10) return 3; if (acres >= 5)  return 2; return 1;
  }
  if (devType === "Multifamily") {
    if (acres >= 15) return 5; if (acres >= 8)  return 4;
    if (acres >= 4)  return 3; if (acres >= 2)  return 2; return 1;
  }
  if (acres >= 10) return 5; if (acres >= 5) return 4;
  if (acres >= 2)  return 3; if (acres >= 1) return 2; return 1;
}

// ─── Combined search ──────────────────────────────────────────────────────────
export async function searchAllSources({ county, minAcres, devType, vacantOnly } = {}) {
  const parcels = await searchNCParcels({ county, minAcres, vacantOnly });

  // Deduplicate by address
  const seen   = new Set();
  const unique = parcels.filter((p) => {
    const key = p.address.toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.map((p) => parcelToProspect(p, devType ?? "Residential"));
}

export function parcelToProspect(parcel, devType = "Residential") {
  return {
    id:             `parcel-${parcel.parcelId}-${Math.random().toString(36).slice(2)}`,
    name:           parcel.address.split(",")[0] || "Unnamed Parcel",
    county:         parcel.county,
    type:           devType,
    status:         "Prospect",
    acres:          Math.round(parcel.acres * 10) / 10,
    askingPrice:    parcel.totalValue ?? 0,
    address:        parcel.address,
    zoning:         parcel.zoning,
    contact:        parcel.owner,
    phone:          "",
    notes:          `Source: ${parcel.source}. ${parcel.isVacant ? "Vacant / unimproved land." : `Improved, built ${parcel.yearBuilt}.`} Land value: $${parcel.landValue?.toLocaleString() ?? "N/A"}. Total assessed: $${parcel.totalValue?.toLocaleString() ?? "N/A"}.`,
    scores:         autoScoreParcel(parcel, devType),
    dateAdded:      parcel.lastUpdated,
    priority:       "Medium",
    isAutoImported: true,
    parcelId:       parcel.parcelId,
    dataSource:     parcel.source,
  };
}
