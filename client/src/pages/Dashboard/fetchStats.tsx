import request from "../../util/request";

export async function fetchStats() {
    const data = await request("GET", "/api/internal/admin/stats");
    return data;
}