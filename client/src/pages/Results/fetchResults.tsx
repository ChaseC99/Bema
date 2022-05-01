import request from "../../util/request";

export async function fetchResults(contestId: string) {
  const data = await request("GET", "/api/internal/results?contestId=" + contestId);
  return {
    results: data.results,
    voting_enabled: data.voting_enabled
  }
}

export async function fetchEntryVotes(entryId: number) {
  const data = await request("GET", "/api/internal/winners/votes?entryId=" + entryId);
  return data.votes;
}

export async function fetchContest(contestId: string) {
  const data = await request("GET", "/api/internal/contests?id=" + contestId);

  return {
    contest: data.contest
  }
}