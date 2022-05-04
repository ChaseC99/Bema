const {
  handleNext,
  successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const { displayFancyDateFormat } = require(process.cwd() + "/util/variables");

exports.get = (request, response, next) => {
  try {
    if (request.decodedToken) {
      if (request.decodedToken.permissions.view_errors || request.decodedToken.is_admin) {
        let { id } = request.query;

        if (id) {
          return db.query("SELECT *, to_char(error_tstz, $1) as error_tstz FROM error WHERE error_id = $2 ORDER BY error_id DESC", [displayFancyDateFormat, id], res => {
            if (res.error) {
              return handleNext(next, 400, "There was a problem getting the requested error.", res.error);
            }
            return response.json({
              logged_in: true,
              is_admin: request.decodedToken.is_admin,
              error: res.rows.length > 0 ? res.rows[0] : null
            });
          });
        } else {
          return db.query("SELECT *, to_char(error_tstz, $1) as error_tstz FROM error ORDER BY error_id DESC", [displayFancyDateFormat], res => {
            if (res.error) {
              return handleNext(next, 400, "There was a problem getting all the logged errors.", res.error);
            }
            return response.json({
              logged_in: true,
              is_admin: request.decodedToken.is_admin,
              errors: res.rows
            });
          });
        }
      } else {
        handleNext(next, 403, "You're not authorized to access logged errors.");
      }
    } else {
      handleNext(next, 401, "You must log in to access logged errors.")
    }
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while retrieving logged errors.", error);
  }
}

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