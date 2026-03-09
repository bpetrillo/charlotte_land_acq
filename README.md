# 📍 LandTrack — Charlotte Metro

> Land acquisition pipeline management for residential, multifamily, and commercial development across the Charlotte metro area.

---

## Features

- **Site Tracking** — Log prospects with address, acreage, asking price, zoning, contact, and field notes
- **Weighted Scoring** — 6-criteria scoring system with type-specific weights (Residential, Multifamily, Commercial)
- **Pipeline Board** — Kanban view across all deal stages: Prospect → Under Review → LOI → Under Contract → Closed / Dead
- **Zoning Key** — 30+ Charlotte-Mecklenburg UDO codes + Union, Cabarrus, Iredell county designations with plain-English descriptions
- **Score Guide** — Visual breakdown of how criteria are weighted per development type

---

## Scoring Criteria

| Criterion | Residential | Multifamily | Commercial |
|---|---|---|---|
| Parcel Size / Acreage | 1.2× | 1.0× | 0.9× |
| Zoning Classification | 1.1× | 1.2× | 1.3× |
| Road / Highway Access | 0.9× | 1.3× | **1.5×** |
| Utilities Availability | 1.0× | 1.2× | 1.1× |
| School District Quality | **1.5×** | 0.8× | 0.5× |
| Low Competitor Activity | 1.0× | 1.1× | 1.3× |

**Score thresholds:**
- 🟢 72%+ — Strong opportunity, pursue actively
- 🟡 52–71% — Conditional, dig deeper before committing
- 🔴 <52% — Weak fit, consider passing or low-ball offer

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Install & run locally

```bash
git clone https://github.com/YOUR_USERNAME/landtrack.git
cd landtrack
npm install
npm run dev
```

App will open at `http://localhost:3000`

### Build for production

```bash
npm run build
```

Output goes to `dist/`. Deploy to Vercel, Netlify, or any static host.

---

## Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Follow the prompts — Vercel auto-detects Vite. Your app will be live at `https://landtrack.vercel.app` (or a custom domain).

---

## Project Structure

```
landtrack/
├── src/
│   ├── components/
│   │   ├── ui.jsx            # Shared primitives (Pill, ScoreRing, ScoreBar)
│   │   ├── SiteCard.jsx      # List item card
│   │   ├── SiteDetail.jsx    # Right-panel detail view
│   │   ├── Sidebar.jsx       # Filter + site list panel
│   │   ├── AddSiteModal.jsx  # New site form
│   │   ├── PipelineView.jsx  # Kanban board
│   │   ├── ZoningKey.jsx     # Zoning code reference table
│   │   └── ScoreGuide.jsx    # Scoring methodology explainer
│   ├── data/
│   │   ├── sampleSites.js    # Seed data (replace with real data)
│   │   └── zoningCodes.js    # Zoning code definitions
│   ├── hooks/
│   │   ├── useSites.js       # Site state + CRUD
│   │   └── useFilters.js     # Filter + search state
│   ├── utils/
│   │   └── scoring.js        # weightedScore(), scoreColor(), scoreTier()
│   ├── constants.js          # Shared enums, colors, criteria, weights
│   ├── App.jsx               # Root component + layout
│   └── index.jsx             # Entry point
├── index.html
├── vite.config.js
├── package.json
└── .gitignore
```

---

## Roadmap

- [ ] Persistent storage (localStorage or Supabase backend)
- [ ] Export pipeline to PDF / Excel
- [ ] Google Maps parcel overlay integration
- [ ] Comparable sales / $/acre benchmarks by county
- [ ] Team collaboration (shared pipeline, comments)
- [ ] Email/SMS follow-up reminders per site
- [ ] Mecklenburg/Union county parcel data API integration

---

## License

MIT — free to use and modify for your organization.
