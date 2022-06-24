const db = require(process.cwd() + "/util/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { createJWTToken, handleNext, successMsg, jsonMessage } = require(process.cwd() + "/util/functions");

exports.changePassword = function(request, response, next) {
  try {
    if (request.decodedToken) {
      let {
        evaluator_id,
        new_password
      } = request.body;
      evaluator_id = parseInt(evaluator_id);
      // Check that user is modifying own password or is an admin user
      if (evaluator_id === request.decodedToken.evaluator_id || request.decodedToken.permissions.change_user_passwords || request.decodedToken.is_admin) {
        bcrypt.hash(new_password, saltRounds, function(err, hash) {
          if (err) {
            handleNext(next, 400, "Error while changing password.", err);
          }
          db.query("UPDATE evaluator SET password = $1 WHERE evaluator_id = $2", [hash, evaluator_id], result => {
            if (result.error) {
              return handleNext(next, 400, "There was a problem changing your password.", result.error);
            }
            successMsg(response);
          });
        });
      } else {
        handleNext(next, 403, "You're not authorized to change this user's password.");
      }
    } else {
      handleNext(next, 403, "You're not authorized to access this information. Please log in first.");
    }
  } catch (error) {
    handleNext(next, 500, "Unexpected error while attempting to change a password.", error);
  }
}

exports.logout = function(request, response, next) {
  try {
    if (request.decodedToken) {
      response.clearCookie("jwtToken");
      return response.redirect("/login");
    }
    handleNext(next, 401, "You cannot log out without being logged in first!");
  } catch (error) {
    handleNext(next, 500, "Unexpected error while attempting to log you out.", error)
  }
}

exports.assumeUserIdentity = function(request, response, next) {
  try {
    if (request.decodedToken) {
      let {
        evaluator_kaid
      } = request.body;

      if (!request.decodedToken.is_impersonated && (request.decodedToken.permissions.assume_user_identities || request.decodedToken.is_admin)) {
        let origin_kaid = request.decodedToken.evaluator_kaid;
        response.clearCookie("jwtToken");
        createJWTToken(evaluator_kaid, origin_kaid)
          .then(jwtToken => {
            response.cookie("jwtToken", jwtToken, { expires: new Date(Date.now() + 86400000) });
            successMsg(response);
          })
          .catch(err => handleNext(next, 400, err.message));
      } else if (request.decodedToken.is_impersonated) {
        let origin_kaid = request.decodedToken.origin_kaid;
        response.clearCookie("jwtToken");
        createJWTToken(origin_kaid)
          .then(jwtToken => {
            response.cookie("jwtToken", jwtToken, { expires: new Date(Date.now() + 86400000) });
            successMsg(response);
          })
          .catch(err => handleNext(next, 400, err.message));
      } else {
        handleNext(next, 403, "You're not authorized to assumer other users' identities.");
      }
    } else {
      handleNext(next, 401, "You're not authorized to acceess this information. Please log in first.");
    }
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while trying to assume a user's identity.", error);
  }
}