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

request("get", "https://public-api.freshstatus.io/v1/public-banner/f3f2072e-abbb-4fa6-a249-67490257135a/", null, (data) => {
    if (!data.error) {
        if (data.incidents.length > 0) {
            // There is an active incident, so display the incident banner
            let incident = data.incidents[0];

            if (incident.is_planned) {
                // This is a scheduled maintenance, so load that banner
                let banner = document.getElementById("maintenance-banner");
                let btn = document.querySelector("#maintenance-banner .btn-primary");

                btn.href = "http://status.kachallengecouncil.org/incident/" + incident.id;
                banner.hidden = false;
            } else {
                // This is an unplanned site issue, so load that banner
                let banner = document.getElementById("incident-banner");
                let btn = document.querySelector("#incident-banner .btn-primary");

                btn.href = "http://status.kachallengecouncil.org/incident/" + incident.id;
                banner.hidden = false;
            }
        }
    } else {
        alert(d.error.message);
    }
});
