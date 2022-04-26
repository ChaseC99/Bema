import request from "../../../util/request";

export async function fetchContests() {
    const data = await request("GET", "/api/internal/contests");
    return data.contests;
}