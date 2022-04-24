import request from "../../../util/request";

export async function fetchCurrentContest() {
  const data = await request("GET", "/api/internal/contests/getCurrentContest");
  const currentContestId = data.currentContest.contest_id;
  return currentContestId;
}

export async function fetchLastContestEvaluatedByUser(userId: number) {
  const data = await request("GET", "/api/internal/contests/getContestsEvaluatedByUser?userId="+userId);
  const id = data.contests.length > 0 ? data.contests[0].contest_id : null;
  return id;
}