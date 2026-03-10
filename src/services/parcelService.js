/**
 * parcelService.js — ArcGIS-powered Charlotte Metro parcel search
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
    console.warn("ArcGIS credentials not configured in environment variables.");
    return null;
  }

  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 120_000) {
    return _tokenCache.token;
  }

  try {
    const res = await fetch("https://www.arcgis.com/sharing/rest/oauth2/token", {
      method: "POST",
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
    return _tokenCache.token;
  } catch (err) {
    console.error("ArcGIS token fetch failed:", err.message);
    return null;
  }
}

// ─── NC OneMap Statewide Parcel Layer ─────────────────────────────────────────
// Covers all Charlotte metro counties. CORS-friendly.
const NC_PARCEL_URL =
  "https://services.nconemap.gov/secure/rest/services/NC1Map_Parcels/FeatureServer/1/query";

const COUNTY_FIPS = {
  Mecklenburg: "119",
  Cabarrus:    "025",
  Union:       "179",
  Iredell:     "097",
  Gaston:      "071",
  Rowan:       "159",
  Lincoln:     "109",
};

export async function searchNCParcels({ county, minAcres, vacantOnly } = {}) {
  const token = await getArcGISToken();
  const whereParts = ["1=1"];

  if (county && COUNTY_FIPS[county]) {
    whereParts.push(`COUNTY_FIPS = '${COUNTY_FIPS[county]}'`);
  }
  if (minAcres)   whereParts.push(`CALC_ACRES >= ${minAcres}`);
  if (vacantOnly) whereParts.push(`LAND_CLASS LIKE '%VACANT%'`);

  const params = new URLSearchParams({
    where:             whereParts.join(" AND "),
    outFields:         "PIN,OWNER,SITE_ADDRESS,CITY,CALC_ACRES,ZONING,LAND_VALUE,TOTAL_VALUE,YEAR_BUILT,LAND_CLASS",
    returnGeometry:    false,
    f:                 "json",
    resultRecordCount: 50,
    ...(token ? { token } : {}),
  });

  try {
    const res  = await fetch(`${NC_PARCEL_URL}?${params}`);
    const data = await res.json();
    if (data.error) {
      console.warn("NC OneMap error:", data.error.message);
      return [];
    }
    if (!data.features?.length) return [];
    return data.features.map((f) => normalizeNCParcel(f.attributes, county));
  } catch (err) {
    console.error("NC Parcel fetch failed:", err.message);
    return [];
  }
}

function normalizeNCParcel(a, county) {
  return {
    parcelId:    a.PIN ?? String(Math.random()),
    source:      "NC OneMap",
    county:      county ?? "",
    owner:       a.OWNER        ?? "Unknown",
    address:     [a.SITE_ADDRESS, a.CITY, "NC"].filter(Boolean).join(", "),
    acres:       parseFloat(a.CALC_ACRES) || 0,
    zoning:      a.ZONING       ?? "",
    landValue:   a.LAND_VALUE   ?? 0,
    totalValue:  a.TOTAL_VALUE  ?? 0,
    yearBuilt:   a.YEAR_BUILT   ?? null,
    isVacant:    a.LAND_CLASS?.includes("VACANT") || !a.YEAR_BUILT,
    lastUpdated: new Date().toISOString().split("T")[0],
  };
}

// ─── ArcGIS Living Atlas US Parcels ───────────────────────────────────────────
// Premium content — requires ArcGIS subscription with Living Atlas access.
const LIVING_ATLAS_URL =
  "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Parcels/FeatureServer/0/query";

export async function searchLivingAtlasParcels({ county, minAcres, vacantOnly } = {}) {
  const token = await getArcGISToken();
  if (!token) return [];

  const whereParts = [`STATE_NAME = 'North Carolina'`];
  if (county)     whereParts.push(`COUNTY_NAME = '${county} County'`);
  if (minAcres)   whereParts.push(`LOT_SIZE_AC >= ${minAcres}`);
  if (vacantOnly) whereParts.push(`LAND_USE LIKE '%VACANT%'`);

  const params = new URLSearchParams({
    where:             whereParts.join(" AND "),
    outFields:         "APN,OWNER_NAME,SITUS_ADDRESS,SITUS_CITY,LOT_SIZE_AC,ZONING,LAND_VALUE,TOTAL_VALUE,YEAR_BUILT,LAND_USE",
    returnGeometry:    false,
    f:                 "json",
    resultRecordCount: 50,
    token,
  });

  try {
    const res  = await fetch(`${LIVING_ATLAS_URL}?${params}`);
    const data = await res.json();
    if (data.error) {
      console.warn("Living Atlas not accessible:", data.error.message);
      return [];
    }
    if (!data.features?.length) return [];
    return data.features.map((f) => normalizeLivingAtlasParcel(f.attributes, county));
  } catch (err) {
    console.error("Living Atlas fetch failed:", err.message);
    return [];
  }
}

function normalizeLivingAtlasParcel(a, county) {
  return {
    parcelId:    a.APN ?? String(Math.random()),
    source:      "ArcGIS Living Atlas",
    county:      county ?? "",
    owner:       a.OWNER_NAME  ?? "Unknown",
    address:     [a.SITUS_ADDRESS, a.SITUS_CITY, "NC"].filter(Boolean).join(", "),
    acres:       parseFloat(a.LOT_SIZE_AC) || 0,
    zoning:      a.ZONING      ?? "",
    landValue:   a.LAND_VALUE  ?? 0,
    totalValue:  a.TOTAL_VALUE ?? 0,
    yearBuilt:   a.YEAR_BUILT  ?? null,
    isVacant:    a.LAND_USE?.includes("VACANT") || !a.YEAR_BUILT,
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
  // Run both sources in parallel — each fails gracefully
  const [ncResult, laResult] = await Promise.allSettled([
    searchNCParcels({ county, minAcres, vacantOnly }),
    searchLivingAtlasParcels({ county, minAcres, vacantOnly }),
  ]);

  const allParcels = [
    ...(ncResult.status === "fulfilled" ? ncResult.value : []),
    ...(laResult.status === "fulfilled" ? laResult.value : []),
  ];

  // Deduplicate by address
  const seen   = new Set();
  const unique = allParcels.filter((p) => {
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
