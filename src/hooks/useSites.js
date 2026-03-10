import { useState, useMemo } from "react";
import SAMPLE_SITES from "../data/sampleSites";
import { weightedScore } from "../utils/scoring";

export function useSites() {
  const [sites, setSites] = useState(SAMPLE_SITES);

  const addSite = (site) => {
    setSites((prev) => [
      {
        ...site,
        id: site.id ?? Date.now(),
        acres: parseFloat(site.acres) || 0,
        askingPrice: parseFloat(site.askingPrice) || 0,
        dateAdded: site.dateAdded ?? new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
  };

  const addSites = (newSites) => {
    const normalized = newSites.map((site) => ({
      ...site,
      id: site.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      acres: parseFloat(site.acres) || 0,
      askingPrice: parseFloat(site.askingPrice) || 0,
      dateAdded: site.dateAdded ?? new Date().toISOString().split("T")[0],
    }));
    setSites((prev) => [...normalized, ...prev]);
  };

  const updateStatus = (id, status) => {
    setSites((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const stats = useMemo(() => {
    const active = sites.filter((s) => !["Dead", "Closed"].includes(s.status));
    return {
      total: sites.length,
      active: active.length,
      totalValue: (active.reduce((a, s) => a + s.askingPrice, 0) / 1e6).toFixed(1),
      totalAcres: active.reduce((a, s) => a + s.acres, 0).toFixed(0),
      avgScore: active.length
        ? Math.round(
            active.reduce((a, s) => a + weightedScore(s.scores, s.type), 0) / active.length
          )
        : 0,
    };
  }, [sites]);

  return { sites, addSite, addSites, updateStatus, stats };
}
