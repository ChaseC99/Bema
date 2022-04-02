const request = async (method: "GET" | "POST" | "PUT", path: string, bodyData?: object) => {
  const response = await fetch(path, (method === "GET") ? undefined : {
    method,
    body: JSON.stringify(bodyData),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();
  return data;
};

export default request;