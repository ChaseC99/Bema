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
        if (data.evaluator_id) {
            let link = document.querySelector("#profile-page-link");
            link.setAttribute("href", "/evaluator/" + data.evaluator_id);
        }
    } else {
        alert(d.error.message);
    }
});
