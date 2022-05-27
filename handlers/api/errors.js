const {
  handleNext,
  successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const { displayFancyDateFormat } = require(process.cwd() + "/util/variables");

exports.delete = (request, response, next) => {
  try {
    let error_id = request.body.error_id;
    if (request.decodedToken) {
      if (request.decodedToken.permissions.delete_errors || request.decodedToken.is_admin) {
        return db.query("DELETE FROM error WHERE error_id = $1", [error_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem deleting this logged error.", res.error);
          }
          successMsg(response);
        });
      } else {
        handleNext(next, 403, "You're not authorized to delete logged errors.")
      }
    } else {
      handleNext(next, 401, "You must log in to delete logged errors.")
    }
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while deleting a logged error.", error);
  }
}

module.exports = exports;