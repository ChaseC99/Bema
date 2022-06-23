/** Handlers for GETTING, EDITING, and DELETING evaluations **/

const {
  handleNext,
  successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.delete = (request, response, next) => {
  try {
    if (request.decodedToken) {
      let {
        evaluation_id
      } = request.body;
      let {
        is_admin
      } = request.decodedToken;

      if (request.decodedToken.permissions.delete_all_evaluations || is_admin) {
        return db.query("DELETE FROM evaluation WHERE evaluation_id = $1", [evaluation_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem deleting this evaluation.", res.error);
          }
          successMsg(response);
        });
      } else {
        return handleNext(next, 403, "You're not authorized to delete evaluations.");
      }
    }
    return handleNext(next, 401, "You must log in to delete evaluations.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while deleting this evaluation.", error);
  }
};

module.exports = exports;