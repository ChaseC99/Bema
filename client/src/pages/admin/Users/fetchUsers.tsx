import request from "../../../util/request";

export async function fetchUsers() {
  const data = await request("GET", "/api/internal/users");

  return {
    users: data.evaluators
  };
}