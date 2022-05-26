import request from "../../../util/request";

export async function fetchLastContestEvaluatedByUser(userId: number) {
  const data = await request("GET", "/api/internal/contests/getContestsEvaluatedByUser?userId="+userId);
  const id = data.contests.length > 0 ? data.contests[0].contest_id : null;
  return id;
}