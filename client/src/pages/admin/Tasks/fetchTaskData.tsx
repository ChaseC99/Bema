import request from "../../../util/request";

export async function fetchIncompleteTasks() {
  const data = await request("GET", "/api/internal/tasks/incomplete");

  return data.tasks;
}

export async function fetchCompleteTasks() {
  const data = await request("GET", "/api/internal/tasks/complete");

  return data.tasks;
}