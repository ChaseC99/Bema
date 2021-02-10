const db = require("../util/db");
const jwt = require("jsonwebtoken");
const { createJWTToken, handleNext, successMsg, jsonMessage } = require(process.cwd() + "/util/functions");

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

                        response.clearCookie("jwtToken");
                        return response.redirect("/login");
                    } else if (evaluator.force_update) {
                        // The evaluator's token needs to be updated, since important account changes have occurred
                          db.query("UPDATE evaluator SET force_update = false WHERE evaluator_id = $1", [evaluator.evaluator_id], res => {
                              if (res.error) {
                                  return handleNext(next, 400, "There was a problem updating the force_update flag.", res.error);
                              }
                              response.clearCookie("jwtToken");
                              createJWTToken(evaluator.evaluator_kaid)
                                .then(jwtToken => {
                                    response.cookie("jwtToken", jwtToken, { expires: new Date(Date.now() + 86400000) });
                                    jwt.verify(jwtToken, process.env.SECRET_KEY, (err, decoded) => {
                                        if (err) {
                                            request.decodedToken = null;
                                            next();
                                        } else if (decoded) {
                                            request.decodedToken = decoded;
                                            next();
                                        }
                                    });
                                })
                                .catch(err => handleNext(next, 400, "There was a problem updating your login token.", err));
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
