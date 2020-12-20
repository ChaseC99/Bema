let request = (method = "post", path, data, callback) => {
    fetch(path, (method === "get") ? null : {
        method,
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => callback(data))
    .catch(err => alert(err)); // Will change later.
};

let logout = e => {
    e.preventDefault();
    fetch("/api/auth/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(data => {
        window.location.href = "/login";
    });
};

request("get", "/api/internal/users/id", null, (data) => {
    if (!data.error) {
        let link = document.querySelector("#profile-page-link");
        link.setAttribute("href", "/evaluator/" + data.evaluator_id);
    } else {
        alert(d.error.message);
    }
});
