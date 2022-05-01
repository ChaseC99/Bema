import request from "../../../util/request";

export async function fetchErrorDetails(id: number) {
  const data = await request("GET", "/api/internal/errors?id=" + id);

  return {
    error: data.error
  }
}