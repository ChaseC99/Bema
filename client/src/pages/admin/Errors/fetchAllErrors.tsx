import request from "../../../util/request";

export async function fetchAllErrors() {
    const data = await request("GET", "/api/internal/errors");

    return {
        errors: data.errors
    };
}