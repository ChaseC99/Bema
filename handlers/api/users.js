/** Handlers GETTING, ADDING, EDITING, and DELETING users. **/

const {
  handleNext,
  successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.assignToEvaluatorGroup = (request, response, next) => {
  try {
    if (request.decodedToken) {
      let {
        evaluator_id,
        group_id
      } = request.body;
      let {
        is_admin
      } = request.decodedToken;

      if (request.decodedToken.permissions.assign_evaluator_groups || is_admin) {
        return db.query("UPDATE evaluator SET group_id = $1 WHERE evaluator_id = $2", [group_id, evaluator_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem assigning this user to an evaluator group.", res.error);
          }
          successMsg(response);
        });
      } else {
        return handleNext(next, 403, "You're not authorized to assign this user to an evaluator group.");
      }
    }
    return handleNext(next, 401, "You must log in to assign a user to an evaluator group.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while assigning a user to an evaluator group.", error);
  }
}

module.exports = exports;