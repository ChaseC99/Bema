import request from "../../util/request";

async function fetchContests() {
  const data = await request("GET", "/api/internal/contests");
  
  return {
    contests: data.contests
  }
}

export default fetchContests;