import request from "../../util/request";

export async function fetchEvaluatorStats(evaluatorId: number) {
  const data = await request("GET", "/api/internal/users/stats?userId=" + evaluatorId);

  return {
    totalContestsJudged: data.totalContestsJudged,
    totalEvaluations: data.totalEvaluations
  };
}