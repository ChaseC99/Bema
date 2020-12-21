const db = require(process.cwd() + "/util/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { createJWTToken, handleNext, successMsg, jsonMessage } = require(process.cwd() + "/util/functions");

exports.login = function(request, response, next) {
    if (request.decodedToken) {
        return handleNext(next, 400, "You are already logged in");
    }
    let {
        username,
        password
    } = request.body;
    // If not logged in, attempt to connect user
    db.query("SELECT username, password, evaluator_kaid, account_locked FROM evaluator WHERE username = $1", [username], res => {
        if (res.error) {
            return handleNext(next, 400, "There was a problem searching for this user");
        }
        if (res.rows.length === 0) {
            // No user with the given username was found
            return handleNext(next, 400, "Incorrect username or password");
        } else {
            bcrypt.compare(password, res.rows[0].password, function(err, result) {
                if (result) {
                    // Passwords match
                    if (res.rows[0].account_locked) {
                        return handleNext(next, 400, "This account has been disabled. Please contact an administrator for assistance.");
                    } else {
                        db.query("UPDATE evaluator SET logged_in_tstz = CURRENT_TIMESTAMP WHERE evaluator_kaid = $1", [res.rows[0].evaluator_kaid], result => {
                            if (result.error) {
                                return handleNext(next, 400, "There was a problem logging you in");
                            }
                            createJWTToken(res.rows[0].evaluator_kaid)
                              .then(jwtToken => {
                                  response.cookie("jwtToken", jwtToken, { expires: new Date(Date.now() + 86400000) });
                                  successMsg(response);
                              })
                              .catch(err => handleNext(next, 400, err.message));
                        });
                    }
                } else {
                    // Passwords do not match
                    return handleNext(next, 400, "Incorrect username or password");
                }
            });
        }

    });
}

exports.changePassword = function(request, response, next) {
    if (request.decodedToken) {
        let {
            evaluator_id,
            new_password
        } = request.body;
        evaluator_id = parseInt(evaluator_id);
        // Check that user is modifying own password or is an admin user
        if (evaluator_id === request.decodedToken.evaluator_id || request.decodedToken.is_admin) {
            bcrypt.hash(new_password, saltRounds, function(err, hash) {
                if (err) {
                    handleNext(next, 400, "Error changing password");
                }
                db.query("UPDATE evaluator SET password = $1 WHERE evaluator_id = $2", [hash, evaluator_id], result => {
                    if (result.error) {
                        return handleNext(next, 400, "There was a problem changing your password");
                    }
                    successMsg(response);
                });
            });
        } else {
            handleNext(next, 403, "Insufficient access");
        }
    } else {
        handleNext(next, 403, "Insufficient access");
    }
}

exports.logout = function(request, response, next) {
    if (request.decodedToken) {
        response.clearCookie("jwtToken");
        return response.redirect("/login");
    }
    handleNext(next, 401, "You cannot logout if you are not logged in first, silly");
}

exports.assumeUserIdentity = function(request, response, next) {
    try {
        if (request.decodedToken) {
            let {
                evaluator_kaid
            } = request.body;

            if (request.decodedToken.is_admin) {
                response.clearCookie("jwtToken");
                createJWTToken(evaluator_kaid)
                  .then(jwtToken => {
                      response.cookie("jwtToken", jwtToken, { expires: new Date(Date.now() + 86400000) });
                      successMsg(response);
                  })
                  .catch(err => handleNext(next, 400, err.message));
            } else {
                handleNext(next, 403, "Insufficient access");
            }
        } else {
            handleNext(next, 401, "Unauthorized");
        }
    } catch (err) {
        return handleNext(next, 400, "There was a problem assuming this user's identity");
    }
}
