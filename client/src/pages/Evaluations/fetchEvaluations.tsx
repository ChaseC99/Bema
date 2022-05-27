import request from "../../util/request";

export async function fetchEvaluations(contestId: number, evaluatorId: number) {
  const data = await request("GET", `/api/internal/evaluations?contestId=${contestId}&userId=${evaluatorId}`);

  return {
    evaluations: data.evaluations,
    canEdit: data.can_edit
  }
}