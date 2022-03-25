const request = (method: "GET" | "POST" | "PUT", path: string, data: object, callback: (data: any) => any) => {
    fetch(path, (method === "GET") ? undefined : {
        method,
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => callback(data))
    .catch(err => callback({error: err}));
};

export default request;