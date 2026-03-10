import { useState, useMemo } from "react";
import { weightedScore } from "../utils/scoring";

const DEFAULT_FILTERS = {
  type: "All",
  status: "All",
  county: "All",
  minScore: 0,
};

export function useFilters(sites) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
  };

  const filtered = useMemo(
    () =>
      sites.filter((s) => {
        if (filters.type !== "All" && s.type !== filters.type) return false;
        if (filters.status !== "All" && s.status !== filters.status) return false;
        if (filters.county !== "All" && s.county !== filters.county) return false;
        if (weightedScore(s.scores, s.type) < filters.minScore) return false;
        if (search) {
          const q = search.toLowerCase();
          if (
            !s.name.toLowerCase().includes(q) &&
            !s.address.toLowerCase().includes(q) &&
            !s.county.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      }),
    [sites, filters, search]
  );

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => weightedScore(b.scores, b.type) - weightedScore(a.scores, a.type)
      ),
    [filtered]
  );

  return { filters, setFilter, search, setSearch, resetFilters, filtered, sorted };
}
