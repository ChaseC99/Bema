import request from "../../util/request";

export async function fetchJudgingCriteria() {
  const data = await request("GET", "/api/internal/judging/criteria");

  return {
    criteria: data.judging_criteria
  };
}

export async function fetchNextEntry() {
  const data = await request("GET", "/api/internal/judging/getNextEntry");

  return {
    entry: data.entry
  };
}