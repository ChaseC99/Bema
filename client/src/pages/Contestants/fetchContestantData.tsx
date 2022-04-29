import request from "../../util/request";

export async function fetchContestantSearchData(searchInput: string) {
  const data = await request("GET", "/api/internal/contestants/search?searchQuery=" + encodeURIComponent(searchInput));
  
  return {
    contestants: data.contestants
  };
}