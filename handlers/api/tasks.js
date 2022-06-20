/** Handlers for GETTING, ADDING, EDITING, and DELETING tasks. **/

const { handleNext, successMsg } = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.signUpForTask = (request, response, next) => {
  try {
    if (request.decodedToken) {
      let {
        task_id
      } = request.body;

      return db.query("UPDATE task SET assigned_member = $1 WHERE task_id = $2", [request.decodedToken.evaluator_id, task_id], res => {
        if (res.error) {
          return handleNext(next, 400, "There was a problem signing you up for this task.", res.error);
        }
        successMsg(response);
      });
    }
    return handleNext(next, 401, "You must log in to sign up for a task.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while signing up for a task.", error);
  }
}

module.exports = exports;