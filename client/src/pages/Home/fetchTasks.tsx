import request from "../../util/request";

export async function fetchMyTasks() {
    const data = await request("GET", "/api/internal/tasks/user");
    return data.tasks;
}

export async function fetchAvailableTasks() {
    const data = await request("GET", "/api/internal/tasks/available");
    return data.tasks;
}