import request from "../../../util/request";

export async function fetchNextEntry() {
  const data = await request("GET", "/api/internal/admin/skillLevels/getNextEntryToReview");

  return {
    entry: data.entry
  };
}

export async function fetchUserEntries(userKaid: string) {
  const data = await request("GET", "/api/internal/contestants/entries?id=" + userKaid);

  return {
    entries: data.entries
  };
}