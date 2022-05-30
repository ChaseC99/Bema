/** Handlers for GETTING, ADDING, EDITING, and DELETING tasks. **/

const { handleNext, successMsg } = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const dateFormat = "FMMM-FMDD-YYYY";

exports.add = (request, response, next) => {
  try {
    if (request.decodedToken) {
      if (request.decodedToken.permissions.edit_all_tasks || request.decodedToken.is_admin) {
        let {
          task_title,
          due_date,
          assigned_member,
          task_status
        } = request.body;

        return db.query("INSERT INTO task (task_title, due_date, assigned_member, task_status) VALUES ($1, $2, $3, $4)", [task_title, due_date, assigned_member, task_status], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem adding this task.", res.error);
          }
          successMsg(response);
        });
      }
      return handleNext(next, 403, "You're not authorized to create tasks.");
    }
    return handleNext(next, 401, "You must log in to create tasks.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while creating a task.", error);
  }
}

exports.edit = (request, response, next) => {
  try {
    if (request.decodedToken) {
      let {
        edit_task_id,
        edit_task_title,
        edit_due_date,
        edit_assigned_member,
        edit_task_status
      } = request.body;

      return db.query("SELECT assigned_member, task_status FROM task WHERE task_id = $1", [edit_task_id], res => {
        if (res.error) {
          return handleNext(next, 400, "There was a problem getting this task's owner.", res.error);
        }
        let evaluator_id = res.rows[0].assigned_member;
        let currentStatus = res.rows[0].task_status;

        if (edit_task_title && (request.decodedToken.permissions.edit_all_tasks || request.decodedToken.is_admin)) {
          return db.query("UPDATE task SET task_title = $1, due_date = $2, assigned_member = $3, task_status = $4 WHERE task_id = $5", [edit_task_title, edit_due_date, edit_assigned_member, edit_task_status, edit_task_id], res => {
            if (res.error) {
              return handleNext(next, 400, "There was a problem editing this task.", res.error);
            }
            successMsg(response);
          });
        } else if (evaluator_id === null || evaluator_id === request.decodedToken.evaluator_id || request.decodedToken.permissions.edit_all_tasks || request.decodedToken.is_admin) {
          let newStatus = "Completed";
          if (evaluator_id === null) {
            newStatus = "Not Started";
          } else if (currentStatus === "Not Started") {
            newStatus = "Started";
          }
          return db.query("UPDATE task SET task_status = $1, assigned_member = $2 WHERE task_id = $3", [newStatus, request.decodedToken.evaluator_id, edit_task_id], res => {
            if (res.error) {
              return handleNext(next, 400, "There was a problem editing this task.", res.error);
            }
            successMsg(response);
          });
        } else {
          return handleNext(next, 403, "You're not authorized to edit that task.");
        }
      });
    }
    return handleNext(next, 401, "You must log in to edit tasks.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while editing a task.", error);
  }
}

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

exports.delete = (request, response, next) => {
  try {
    if (request.decodedToken) {
      if (request.decodedToken.permissions.delete_all_tasks || request.decodedToken.is_admin) {
        return db.query("DELETE FROM task WHERE task_id = $1;", [request.body.task_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem deleting this task.", res.error);
          }
          successMsg(response);
        });
      }
      return handleNext(next, 403, "You're not authorized to delete tasks.");
    }
    return handleNext(next, 401, "You must log in to delete a task.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while deleting a task.");
  }
}

module.exports = exports;