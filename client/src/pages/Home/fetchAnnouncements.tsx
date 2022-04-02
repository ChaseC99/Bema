import request from "../../util/request";

export async function fetchAnnouncements() {
  const data = await request("GET", "/api/internal/messages");

  return data.messages;
}