import request from "../../util/request";

export async function fetchEvaluations(contestId: number, evaluatorId: number) {
  const data = await request("GET", `/api/internal/evaluations?contestId=${contestId}&userId=${evaluatorId}`);

  return {
    evaluations: data.evaluations,
    canEdit: data.can_edit
  }
}

export async function fetchUsers() {
  const data = await request("GET", "/api/internal/users");

  return {
    users: data.evaluators
  }
}