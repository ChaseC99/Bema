import request from "../../../util/request";

export async function fetchContestData(evaluatorId: number) {
  const data = await request("GET", "/api/internal/contests/getContestsEvaluatedByUser?userId=" + evaluatorId);

  return {
    contests: data.contests
  };
}