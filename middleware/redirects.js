const redirects = (request, response, next) => {
    if (request.headers.host === "bema.herokuapp.com") {
        return response.redirect("https://www.kachallengecouncil.org" + request.url);
    }
    else if (request.url === "/status") {
        return response.redirect("http://status.kachallengecouncil.org");
    }
    else if (!request.secure && request.headers.host !== "localhost:"+process.env.PORT) {
        return response.redirect("https://www.kachallengecouncil.org" + request.url);
    }
    next();
}

module.exports = redirects;
