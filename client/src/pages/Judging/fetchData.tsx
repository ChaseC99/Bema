import request from "../../util/request";

export async function fetchNextEntry() {
  const data = await request("GET", "/api/internal/judging/getNextEntry");

  return {
    entry: data.entry
  };
}