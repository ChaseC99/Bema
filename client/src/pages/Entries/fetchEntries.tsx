import request from "../../util/request";

export async function fetchEntries(contestId: string) {
  const data = await request("GET", "/api/internal/entries?contestId=" + contestId);
  return {
    entries: data.entries
  }
}

export async function fetchEvaluatorGroups() {
  const data = await request("GET", "/api/internal/admin/getEvaluatorGroups");
  return {
    groups: data.evaluatorGroups
  }
}

export async function fetchContest(contestId: string) {
  const data = await request("GET", "/api/internal/contests?id=" + contestId);

  return {
    contest: data.contest
  }
}