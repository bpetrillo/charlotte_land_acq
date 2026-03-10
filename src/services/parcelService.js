/**
 * parcelService.js — Charlotte Metro parcel search via ArcGIS Living Atlas
 *
 * Uses ArcGIS OAuth2 app credentials to query the Regrid-powered Living Atlas
 * nationwide parcel layer — no separate NC OneMap token needed.
 *
 * .env variables required:
 *   VITE_ARCGIS_CLIENT_ID=your_client_id
 *   VITE_ARCGIS_CLIENT_SECRET=your_client_secret
 */

// ─── ArcGIS Token ─────────────────────────────────────────────────────────────
let _tokenCache = null;

export async function getArcGISToken() {
  const clientId     = import.meta.env.VITE_ARCGIS_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_ARCGIS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("ArcGIS credentials not configured.");
    return null;
  }

  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 120_000) {
    return _tokenCache.token;
  }

  try {
    const res = await fetch("https://www.arcgis.com/sharing/rest/oauth2/token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     clientId,
        client_secret: clientSecret,
        grant_type:    "client_credentials",
        f:             "json",
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(JSON.stringify(data.error));

    _tokenCache = {
      token:     data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
    console.log("ArcGIS token acquired successfully.");
    return _tokenCache.token;
  } catch (err) {
    console.error("ArcGIS token fetch failed:", err.message);
    return null;
  }
}

// ─── ArcGIS Living Atlas — Regrid US Parcels ─────────────────────────────────
// This is the correct Living Atlas layer powered by Regrid.
// Requires ArcGIS Online subscription with Living Atlas premium content access.
// Layer item: https://www.arcgis.com/home/item.html?id=d9e3cf05f5be4d8b9e3c8a63f1e3ebb0
const REGRID_PARCEL_URL =
  "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/Regrid_Parcels_for_the_United_States/FeatureServer/0/query";

export async function searchLivingAtlasParcels({ county, minAcres, vacantOnly } = {}) {
  const token = await getArcGISToken();
  if (!token) {
    console.warn("No ArcGIS token — skipping Living Atlas search.");
    return [];
  }

  const whereParts = [`state2 = 'NC'`];
  if (county) whereParts.push(`county = '${county.toUpperCase()}'`);
  if (minAcres) whereParts.push(`ll_gisacre >= ${minAcres}`);
  if (vacantOnly) whereParts.push(`usedesc LIKE '%VACANT%'`);

  const params = new URLSearchParams({
    where:             whereParts.join(" AND "),
    outFields:         "parcelnumb,owner,address,city,state2,county,ll_gisacre,zoning,landval,parval,yearbuilt,usedesc",
    returnGeometry:    false,
    f:                 "json",
    resultRecordCount: 50,
    token,
  });

  try {
    const res  = await fetch(`${REGRID_PARCEL_URL}?${params}`);
    const data = await res.json();

    if (data.error) {
      console.warn("Living Atlas Regrid error:", data.error.message);
      // Fall back to ArcGIS Online hosted NC parcels
      return searchArcGISOnlineNCParcels({ county, minAcres, vacantOnly, token });
    }

    if (!data.features?.length) return [];
    console.log(`Living Atlas returned ${data.features.length} parcels.`);
    return data.features.map((f) => normalizeRegridParcel(f.attributes, county));
  } catch (err) {
    console.error("Living Atlas fetch failed:", err.message);
    return searchArcGISOnlineNCParcels({ county, minAcres, vacantOnly, token });
  }
}

function normalizeRegridParcel(a, county) {
  return {
    parcelId:    a.parcelnumb ?? String(Math.random()),
    source:      "ArcGIS Living Atlas (Regrid)",
    county:      county ?? a.county ?? "",
    owner:       a.owner    ?? "Unknown",
    address:     [a.address, a.city, a.state2].filter(Boolean).join(", "),
    acres:       parseFloat(a.ll_gisacre) || 0,
    zoning:      a.zoning   ?? "",
    landValue:   a.landval  ?? 0,
    totalValue:  a.parval   ?? 0,
    yearBuilt:   a.yearbuilt ?? null,
    isVacant:    a.usedesc?.toUpperCase().includes("VACANT") || !a.yearbuilt,
    lastUpdated: new Date().toISOString().split("T")[0],
  };
}

// ─── Fallback: ArcGIS Online hosted NC parcels (public, no token needed) ─────
// Hosted publicly on ArcGIS Online by NC OneMap open data hub
const NC_OPEN_PARCEL_URL =
  "https://services1.arcgis.com/YBQjZE7pCkH6LKOD/arcgis/rest/services/NC_Parcels/FeatureServer/0/query";

const COUNTY_NAMES = {
  Mecklenburg: "MECKLENBURG",
  Cabarrus:    "CABARRUS",
  Union:       "UNION",
  Iredell:     "IREDELL",
  Gaston:      "GASTON",
  Rowan:       "ROWAN",
  Lincoln:     "LINCOLN",
};

export async function searchArcGISOnlineNCParcels({ county, minAcres, vacantOnly, token } = {}) {
  const whereParts = ["1=1"];
  if (county && COUNTY_NAMES[county]) whereParts.push(`COUNTY = '${COUNTY_NAMES[county]}'`);
  if (minAcres)   whereParts.push(`CALCACRES >= ${minAcres}`);
  if (vacantOnly) whereParts.push(`LANDUSE LIKE '%VACANT%'`);

  const params = new URLSearchParams({
    where:             whereParts.join(" AND "),
    outFields:         "PIN,OWNNAME,SITUSADDR,SITUSCITY,CALCACRES,ZONING,LANDVAL,PARVAL,YEARBUILT,LANDUSE",
    returnGeometry:    false,
    f:                 "json",
    resultRecordCount: 50,
    ...(token ? { token } : {}),
  });

  try {
    const res  = await fetch(`${NC_OPEN_PARCEL_URL}?${params}`);
    const data = await res.json();

    if (data.error) {
      console.warn("NC Open Parcels error:", data.error.message);
      return [];
    }
    if (!data.features?.length) return [];
    console.log(`NC Open Parcels returned ${data.features.length} parcels.`);
    return data.features.map((f) => normalizeOpenNCParcel(f.attributes, county));
  } catch (err) {
    console.error("NC Open Parcels fetch failed:", err.message);
    return [];
  }
}

function normalizeOpenNCParcel(a, county) {
  return {
    parcelId:    a.PIN ?? String(Math.random()),
    source:      "NC Parcels (ArcGIS Online)",
    county:      county ?? "",
    owner:       a.OWNNAME    ?? "Unknown",
    address:     [a.SITUSADDR, a.SITUSCITY, "NC"].filter(Boolean).join(", "),
    acres:       parseFloat(a.CALCACRES) || 0,
    zoning:      a.ZONING     ?? "",
    landValue:   a.LANDVAL    ?? 0,
    totalValue:  a.PARVAL     ?? 0,
    yearBuilt:   a.YEARBUILT  ?? null,
    isVacant:    a.LANDUSE?.includes("VACANT") || !a.YEARBUILT,
    lastUpdated: new Date().toISOString().split("T")[0],
  };
}

// ─── Auto-score ───────────────────────────────────────────────────────────────
export function autoScoreParcel(parcel, devType = "Residential") {
  return {
    acreage:     scoreAcreage(parcel.acres, devType),
    zoning:      scoreZoning(parcel.zoning, devType),
    roads:       3,
    utilities:   parcel.isVacant ? 2 : 4,
    schools:     3,
    competition: 3,
  };
}

function scoreZoning(zoning = "", devType) {
  const z = zoning.toUpperCase();
  if (devType === "Residential") {
    if (["R-3","R-4","R-5","R-6","R-8","R-12","R-17","R-20","R-MH"].some((c) => z.includes(c))) return 5;
    if (["MX","RU","UR"].some((c) => z.includes(c))) return 3;
    return 2;
  }
  if (devType === "Multifamily") {
    if (["MX","UR","R-12","R-17","R-20","MF","TOD"].some((c) => z.includes(c))) return 5;
    if (["R-8","R-6"].some((c) => z.includes(c))) return 3;
    return 2;
  }
  if (["B-1","B-2","B-D","NS","CC","MUDD","TOD"].some((c) => z.includes(c))) return 5;
  if (["MX","UR"].some((c) => z.includes(c))) return 3;
  return 2;
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
  // Try Living Atlas first (best data), falls back to NC Open automatically
  const parcels = await searchLivingAtlasParcels({ county, minAcres, vacantOnly });

  // Deduplicate by address
  const seen   = new Set();
  const unique = parcels.filter((p) => {
    const key = p.address.toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const filtered = vacantOnly ? unique.filter((p) => p.isVacant) : unique;
  return filtered.map((p) => parcelToProspect(p, devType ?? "Residential"));
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
    notes:          `Source: ${parcel.source}. ${parcel.isVacant ? "Vacant land." : `Improved, built ${parcel.yearBuilt}.`} Land value: $${parcel.landValue?.toLocaleString() ?? "N/A"}`,
    scores:         autoScoreParcel(parcel, devType),
    dateAdded:      parcel.lastUpdated,
    priority:       "Medium",
    isAutoImported: true,
    parcelId:       parcel.parcelId,
    dataSource:     parcel.source,
  };
}
