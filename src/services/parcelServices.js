/**
 * parcelService.js
 *
 * Charlotte Metro land parcel search using ArcGIS OAuth2 authentication.
 *
 * Setup — add these to your .env file (never commit .env to git):
 *   VITE_ARCGIS_CLIENT_ID=your_client_id_here
 *   VITE_ARCGIS_CLIENT_SECRET=your_client_secret_here
 *
 * Data sources:
 *   1. Mecklenburg County GIS FeatureServer  — free, no token needed
 *   2. NC Statewide Parcel Layer (NC OneMap) — free with ArcGIS token
 *   3. ArcGIS Living Atlas US Parcel Layer   — premium, requires ArcGIS subscription
 */

// ─── ArcGIS Token Manager ─────────────────────────────────────────────────────

let _tokenCache = null;

export async function getArcGISToken() {
  const clientId     = import.meta.env.VITE_ARCGIS_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_ARCGIS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("ArcGIS credentials not set. Add VITE_ARCGIS_CLIENT_ID and VITE_ARCGIS_CLIENT_SECRET to your .env file.");
    return null;
  }

  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 120_000) {
    return _tokenCache.token;
  }

  try {
    const body = new URLSearchParams({
      client_id:     clientId,
      client_secret: clientSecret,
      grant_type:    "client_credentials",
      f:             "json",
    });

    const res  = await fetch("https://www.arcgis.com/sharing/rest/oauth2/token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const data = await res.json();

    if (data.error) {
      console.error("ArcGIS token error:", data.error);
      return null;
    }

    _tokenCache = {
      token:     data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    return _tokenCache.token;
  } catch (err) {
    console.error("Failed to get ArcGIS token:", err);
    return null;
  }
}

// ─── 1. Mecklenburg County GIS (free, no token required) ─────────────────────

const MECK_PARCEL_URL =
  "https://maps.mecknc.gov/arcgis/rest/services/LUESA/ParcelData/MapServer/0/query";

export async function searchMecklenburgParcels({ zoning, minAcres, ownerKeyword } = {}) {
  const whereParts = ["1=1"];
  if (zoning)        whereParts.push(`ZONING_CODE = '${zoning}'`);
  if (minAcres)      whereParts.push(`CALCULATED_ACRES >= ${minAcres}`);
  if (ownerKeyword)  whereParts.push(`OWNER_NAME LIKE '%${ownerKeyword.toUpperCase()}%'`);

  const params = new URLSearchParams({
    where:             whereParts.join(" AND "),
    outFields:         "PARCEL_ID,OWNER_NAME,SITE_ADDRESS,CALCULATED_ACRES,ZONING_CODE,LAND_VALUE,TOTAL_VALUE,YEAR_BUILT",
    returnGeometry:    false,
    f:                 "json",
    resultRecordCount: 50,
  });

  try {
    const res  = await fetch(`${MECK_PARCEL_URL}?${params}`);
    const data = await res.json();
    if (!data.features) return [];
    return data.features.map((f) => normalizeMecklenburgParcel(f.attributes));
  } catch (err) {
    console.error("Mecklenburg GIS error:", err);
    return [];
  }
}

function normalizeMecklenburgParcel(attr) {
  return {
    parcelId:    attr.PARCEL_ID,
    source:      "Mecklenburg GIS",
    county:      "Mecklenburg",
    owner:       attr.OWNER_NAME  ?? "Unknown",
    address:     attr.SITE_ADDRESS ?? "",
    acres:       parseFloat(attr.CALCULATED_ACRES) || 0,
    zoning:      attr.ZONING_CODE  ?? "",
    landValue:   attr.LAND_VALUE   ?? 0,
    totalValue:  attr.TOTAL_VALUE  ?? 0,
    yearBuilt:   attr.YEAR_BUILT   ?? null,
    isVacant:    !attr.YEAR_BUILT,
    lastUpdated: new Date().toISOString().split("T")[0],
  };
}

// ─── 2. NC Statewide Parcel Layer via ArcGIS (token required) ─────────────────

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

export async function searchNCParcels({ county, zoning, minAcres, vacantOnly } = {}) {
  const token = await getArcGISToken();

  const whereParts = ["1=1"];
  if (county && COUNTY_FIPS[county]) whereParts.push(`COUNTY_FIPS = '${COUNTY_FIPS[county]}'`);
  if (minAcres)   whereParts.push(`CALC_ACRES >= ${minAcres}`);
  if (vacantOnly) whereParts.push(`LAND_CLASS LIKE '%VACANT%'`);

  const params = new URLSearchParams({
    where:             whereParts.join(" AND "),
    outFields:         "PIN,OWNER,SITE_ADDRESS,CITY,CALC_ACRES,ZONING,LAND_VALUE,TOTAL_VALUE,YEAR_BUILT,LAND_CLASS",
    returnGeometry:    false,
    f:                 "json",
    resultRecordCount: 50,
    ...(token && { token }),
  });

  try {
    const res  = await fetch(`${NC_PARCEL_URL}?${params}`);
    const data = await res.json();
    if (!data.features) return [];
    return data.features.map((f) => normalizeNCParcel(f.attributes, county));
  } catch (err) {
    console.error("NC Parcel layer error:", err);
    return [];
  }
}

function normalizeNCParcel(attr, county) {
  return {
    parcelId:    attr.PIN,
    source:      "NC OneMap",
    county:      county ?? "",
    owner:       attr.OWNER        ?? "Unknown",
    address:     [attr.SITE_ADDRESS, attr.CITY, "NC"].filter(Boolean).join(", "),
    acres:       parseFloat(attr.CALC_ACRES) || 0,
    zoning:      attr.ZONING       ?? "",
    landValue:   attr.LAND_VALUE   ?? 0,
    totalValue:  attr.TOTAL_VALUE  ?? 0,
    yearBuilt:   attr.YEAR_BUILT   ?? null,
    isVacant:    attr.LAND_CLASS?.includes("VACANT") || !attr.YEAR_BUILT,
    lastUpdated: new Date().toISOString().split("T")[0],
  };
}

// ─── 3. ArcGIS Living Atlas US Parcel Boundaries (premium) ───────────────────

const LIVING_ATLAS_PARCEL_URL =
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
    const res  = await fetch(`${LIVING_ATLAS_PARCEL_URL}?${params}`);
    const data = await res.json();
    if (data.error) {
      console.warn("Living Atlas not accessible:", data.error.message);
      return [];
    }
    if (!data.features) return [];
    return data.features.map((f) => normalizeLivingAtlasParcel(f.attributes, county));
  } catch (err) {
    console.error("Living Atlas parcel error:", err);
    return [];
  }
}

function normalizeLivingAtlasParcel(attr, county) {
  return {
    parcelId:    attr.APN,
    source:      "ArcGIS Living Atlas",
    county:      county ?? "",
    owner:       attr.OWNER_NAME    ?? "Unknown",
    address:     [attr.SITUS_ADDRESS, attr.SITUS_CITY, "NC"].filter(Boolean).join(", "),
    acres:       parseFloat(attr.LOT_SIZE_AC) || 0,
    zoning:      attr.ZONING        ?? "",
    landValue:   attr.LAND_VALUE    ?? 0,
    totalValue:  attr.TOTAL_VALUE   ?? 0,
    yearBuilt:   attr.YEAR_BUILT    ?? null,
    isVacant:    attr.LAND_USE?.includes("VACANT") || !attr.YEAR_BUILT,
    lastUpdated: new Date().toISOString().split("T")[0],
  };
}

// ─── Auto-score from parcel data ──────────────────────────────────────────────

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
    if (acres >= 50) return 5;
    if (acres >= 20) return 4;
    if (acres >= 10) return 3;
    if (acres >= 5)  return 2;
    return 1;
  }
  if (devType === "Multifamily") {
    if (acres >= 15) return 5;
    if (acres >= 8)  return 4;
    if (acres >= 4)  return 3;
    if (acres >= 2)  return 2;
    return 1;
  }
  if (acres >= 10) return 5;
  if (acres >= 5)  return 4;
  if (acres >= 2)  return 3;
  if (acres >= 1)  return 2;
  return 1;
}

// ─── Combined search ──────────────────────────────────────────────────────────

export async function searchAllSources({ county, zoning, minAcres, devType, vacantOnly } = {}) {
  const [meckResults, ncResults, laResults] = await Promise.allSettled([
    county === "Mecklenburg"
      ? searchMecklenburgParcels({ zoning, minAcres })
      : Promise.resolve([]),
    searchNCParcels({ county, zoning, minAcres, vacantOnly }),
    searchLivingAtlasParcels({ county, minAcres, vacantOnly }),
  ]);

  const allParcels = [meckResults, ncResults, laResults]
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  const seen   = new Set();
  const unique = allParcels.filter((p) => {
    const key = p.address.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const filtered = vacantOnly ? unique.filter((p) => p.isVacant) : unique;
  return filtered.map((p) => parcelToProspect(p, devType ?? "Residential"));
}

export function parcelToProspect(parcel, devType = "Residential") {
  return {
    id:             `parcel-${parcel.parcelId ?? Date.now()}-${Math.random().toString(36).slice(2)}`,
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
