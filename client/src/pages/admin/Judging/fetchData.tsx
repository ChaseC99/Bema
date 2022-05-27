import request from "../../../util/request";

type Group = {
  group_id: number
  group_name: string
  is_active: boolean
}

type Evaluator = {
  evaluator_id: number
  evaluator_name: string
  group_id: number
}

export async function fetchFlaggedEntries() {
  const data = await request("GET", "/api/internal/entries/flagged");

  return {
    flaggedEntries: data.flaggedEntries
  };
}

export async function fetchJudgingGroups() {
  const data = await request("GET", "/api/internal/admin/getEvaluatorGroups");

  return {
    groups: data.evaluatorGroups,
    evaluators: data.evaluators
  } as {
    groups: Group[]
    evaluators: Evaluator[]
  };
}