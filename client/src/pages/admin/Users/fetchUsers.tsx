import request from "../../../util/request";

export async function fetchUsers() {
  const data = await request("GET", "/api/internal/users");

  return {
    users: data.evaluators
  };
}

export async function fetchUserPermissions(userId: number) {
  const data = await request("GET", "/api/internal/users/permissions?userId=" + userId);

  return {
    permissions: data.permissions
  };
}