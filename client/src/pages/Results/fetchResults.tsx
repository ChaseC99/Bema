import request from "../../util/request";

export async function fetchEntryVotes(entryId: number) {
  const data = await request("GET", "/api/internal/winners/votes?entryId=" + entryId);
  return data.votes;
}