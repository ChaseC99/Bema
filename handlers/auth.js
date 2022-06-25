const { createJWTToken, handleNext, successMsg } = require(process.cwd() + "/util/functions");

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