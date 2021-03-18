const redirects = (request, response, next) => {
    if (request.headers.host === "bema.herokuapp.com") {
        return response.redirect("https://www.kachallengecouncil.org" + request.url);
    }
    else if (request.headers['x-forwarded-proto'] !== 'https') {
        return response.redirect('https://' + request.headers.host + request.url);
    }
    else if (request.url === "/status") {
        return response.redirect("http://status.kachallengecouncil.org");
    }
    next();
}

module.exports = redirects;
