const db = require("../util/db");
const jwt = require("jsonwebtoken");

const isLoggedIn = (request, response, next) => {
    const jwtToken = request.cookies.jwtToken;
    if (jwtToken) {
        jwt.verify(jwtToken, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                request.decodedToken = null;
                next();
            } else if (decoded) {
                // The user is logged in

                db.query("SELECT * FROM evaluator WHERE evaluator_id = $1", [decoded.evaluator_id], res => {
                    let evaluator = res.rows[0];

                    if (evaluator.account_locked) {
                        request.decodedToken = null;

                        db.query("UPDATE evaluator SET logged_in = false WHERE evaluator_id = $1", [decoded.evaluator_id], res => {
                            response.clearCookie("jwtToken");
                            return response.redirect("/login");
                        });
                    } else {
                        request.decodedToken = decoded;
                        next();
                    }
                });
            } else {
                request.decodedToken = null;
                next();
            }
        });
    } else {
        // They are not logged in.
        request.decodedToken = null;
        next();
    }
}

module.exports = isLoggedIn;
