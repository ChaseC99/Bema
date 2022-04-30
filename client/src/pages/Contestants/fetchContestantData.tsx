import request from "../../util/request";

export async function fetchContestantSearchData(searchInput: string) {
  const data = await request("GET", "/api/internal/contestants/search?searchQuery=" + encodeURIComponent(searchInput));
  
  return {
    contestants: data.contestants
  };
}

export async function fetchContestantStats(contestantKaid: string) {
  const entriesData = await request("GET", "/api/internal/contestants/entries?id=" + contestantKaid);
  const statsData = await request("GET", "/api/internal/contestants/stats?id=" + contestantKaid);

  return {
    entries: entriesData.entries,
    stats: statsData
  };
}