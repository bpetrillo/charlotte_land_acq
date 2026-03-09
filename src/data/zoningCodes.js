// Charlotte-Mecklenburg UDO zoning codes + common suburban county designations.
// Always verify current zoning with the applicable municipality before acquisition decisions.

const ZONING_CODES = {
  // ── Residential ──────────────────────────────────────────────────────────
  "R-3": {
    category: "Residential",
    label: "Single Family – 3 du/ac",
    description: "Low-density single-family. Large lots, 1 unit per ~14,500 sf.",
    compatible: ["Residential"],
  },
  "R-4": {
    category: "Residential",
    label: "Single Family – 4 du/ac",
    description: "Low-density single-family. Min lot ~10,000 sf.",
    compatible: ["Residential"],
  },
  "R-5": {
    category: "Residential",
    label: "Single Family – 5 du/ac",
    description: "Moderate single-family density. Min lot ~8,000 sf.",
    compatible: ["Residential"],
  },
  "R-8": {
    category: "Residential",
    label: "Single Family – 8 du/ac",
    description: "Medium density single-family. Min lot ~5,000 sf.",
    compatible: ["Residential"],
  },
  "R-12": {
    category: "Residential",
    label: "Single Family – 12 du/ac",
    description: "Higher density single-family. Min lot ~3,600 sf.",
    compatible: ["Residential"],
  },
  "R-17MF": {
    category: "Residential",
    label: "Multi Family – 17 du/ac",
    description: "Low-rise multifamily. Townhomes, duplexes, small apartments.",
    compatible: ["Multifamily"],
  },
  "R-20MF": {
    category: "Residential",
    label: "Multi Family – 20 du/ac",
    description: "Medium multifamily. Apartments and condos up to ~3 stories.",
    compatible: ["Multifamily"],
  },
  "R-20": {
    category: "Residential",
    label: "Single Family – Large Lot",
    description: "Low-density rural/suburban. Min lot 20,000 sf. Common in outlying counties.",
    compatible: ["Residential"],
  },
  "R-40": {
    category: "Residential",
    label: "Single Family – Estate Lot",
    description: "Very low density. Min lot ~40,000 sf (nearly 1 ac). Rural character.",
    compatible: ["Residential"],
  },
  "RA-40": {
    category: "Residential",
    label: "Residential-Agricultural",
    description: "Rural residential-agricultural. Common in outlying Union/Cabarrus parcels.",
    compatible: ["Residential"],
  },

  // ── Mixed Use / Urban ─────────────────────────────────────────────────────
  "MX-1": {
    category: "Mixed Use",
    label: "Mixed Use – Neighborhood",
    description: "Small-scale mixed use. Corner retail + residential above. Pedestrian-oriented.",
    compatible: ["Multifamily", "Commercial"],
  },
  "MX-2": {
    category: "Mixed Use",
    label: "Mixed Use – General",
    description: "Mid-scale mixed use. Medium-density residential + retail/office. Up to 6 stories.",
    compatible: ["Multifamily", "Commercial"],
  },
  "MX-3": {
    category: "Mixed Use",
    label: "Mixed Use – Urban",
    description: "High-density mixed use. Urban core intensity. 6–20+ stories allowed.",
    compatible: ["Multifamily", "Commercial"],
  },
  "MU-2": {
    category: "Mixed Use",
    label: "Mixed Use – Community",
    description: "Community-scale mixed use. Big box retail + residential. Suburban corridor.",
    compatible: ["Multifamily", "Commercial"],
  },
  "TOD-CC": {
    category: "Mixed Use",
    label: "Transit-Oriented – City Center",
    description: "High-density TOD near LYNX/transit. Dense residential + active ground floor.",
    compatible: ["Multifamily", "Commercial"],
  },
  "TOD-UC": {
    category: "Mixed Use",
    label: "Transit-Oriented – Urban Center",
    description: "Urban TOD. Mixed residential and commercial within transit areas.",
    compatible: ["Multifamily", "Commercial"],
  },
  "TOD-NC": {
    category: "Mixed Use",
    label: "Transit-Oriented – Neighborhood",
    description: "Lower-scale TOD. 3–6 story residential + neighborhood retail.",
    compatible: ["Multifamily"],
  },

  // ── Commercial ────────────────────────────────────────────────────────────
  "B-1": {
    category: "Commercial",
    label: "Commercial – Neighborhood",
    description: "Small-scale neighborhood retail. Convenience stores, services. No drive-throughs.",
    compatible: ["Commercial"],
  },
  "B-2": {
    category: "Commercial",
    label: "Commercial – General",
    description: "General retail/service commercial. Strip centers, restaurants, QSR. Most common highway commercial.",
    compatible: ["Commercial"],
  },
  "B-D": {
    category: "Commercial",
    label: "Commercial – Downtown",
    description: "Downtown commercial. Ground-floor retail required. Mixed uses encouraged.",
    compatible: ["Commercial", "Multifamily"],
  },
  "NS": {
    category: "Commercial",
    label: "Neighborhood Services",
    description: "Limited commercial for neighborhood-serving uses only. Restricted square footage.",
    compatible: ["Commercial"],
  },
  "CC": {
    category: "Commercial",
    label: "Commercial Center",
    description: "Large commercial nodes. Big box, power centers, auto-oriented retail.",
    compatible: ["Commercial"],
  },
  "RE-1": {
    category: "Commercial",
    label: "Research / Office – Low",
    description: "Low-intensity research, medical office, professional office campus.",
    compatible: ["Commercial"],
  },
  "RE-2": {
    category: "Commercial",
    label: "Research / Office – High",
    description: "High-intensity office/research park. Tech campuses, corporate HQ.",
    compatible: ["Commercial"],
  },
  "O-1": {
    category: "Commercial",
    label: "Office – Low Intensity",
    description: "Professional office. Medical, legal, financial services.",
    compatible: ["Commercial"],
  },
  "O-2": {
    category: "Commercial",
    label: "Office – General",
    description: "General office. Mid-rise office buildings, medical campuses.",
    compatible: ["Commercial"],
  },
  "GC": {
    category: "Commercial",
    label: "General Commercial (Union Co.)",
    description: "Union County general commercial. Similar to Charlotte B-2.",
    compatible: ["Commercial"],
  },
  "HC": {
    category: "Commercial",
    label: "Highway Commercial (Union Co.)",
    description: "Auto-oriented highway commercial. Gas, fast food, hotels.",
    compatible: ["Commercial"],
  },

  // ── Industrial ────────────────────────────────────────────────────────────
  "I-1": {
    category: "Industrial",
    label: "Light Industrial",
    description: "Light manufacturing, warehousing, flex space. No heavy nuisance uses.",
    compatible: [],
  },
  "I-2": {
    category: "Industrial",
    label: "General Industrial",
    description: "General manufacturing and industrial. Heavier uses permitted.",
    compatible: [],
  },
  "BP": {
    category: "Industrial",
    label: "Business Park",
    description: "Office/warehouse flex park. Clean industrial, distribution, tech.",
    compatible: [],
  },
};

export default ZONING_CODES;
