import request from "../../../util/request";

export async function fetchFlaggedEntries() {
  const data = await request("GET", "/api/internal/entries/flagged");

  return {
    flaggedEntries: data.flaggedEntries
  };
}

export async function fetchJudgingGroups() {
  const data = await request("GET", "/api/internal/admin/getEvaluatorGroups");

  return {
    groups: data.evaluatorGroups
  };
}

export async function fetchJudgingCriteria() {
  const data = await request("GET", "/api/internal/judging/allCriteria");

  return {
    criteria: data.judging_criteria
  };
}