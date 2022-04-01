export async function fetchAnnouncements() {
  const response = await fetch("/api/internal/messages");
  const data = await response.json();

  return data.messages;
}