/** Handlers for GETTING, ADDING, EDITING, and DELETING tasks. **/

const { handleNext, successMsg } = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const dateFormat = "FMMM-FMDD-YYYY";

exports.get = (request, response, next) => {
    if (request.decodedToken && request.decodedToken.is_admin) {
        return db.query("SELECT t.task_id, t.task_title, t.task_status, t.assigned_member, evaluator.evaluator_name, to_char(t.due_date, $1) as due_date FROM task t LEFT JOIN evaluator ON t.assigned_member = evaluator.evaluator_id;", [dateFormat], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting all the tasks");
            }
            return response.json({
                logged_in: true,
                is_admin: request.decodedToken.is_admin,
                tasks: res.rows
            });
        });
    }
    response.json({
        logged_in: false,
        is_admin: false
    });
}

exports.getForUser = (request, response, next) => {
    if (request.decodedToken) {
        return db.query("SELECT *, to_char(t.due_date, $1) as due_date FROM task t WHERE assigned_member = $2 AND task_status != 'Completed' ORDER BY t.due_date DESC", [dateFormat, request.decodedToken.evaluator_id], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting tasks for user");
            }
            return response.json({
                logged_in: true,
                is_admin: request.decodedToken.is_admin,
                tasks: res.rows
            });
        });
    }
    response.json({
        logged_in: false,
        is_admin: false
    });
}

exports.getAvailable = (request, response, next) => {
    if (request.decodedToken) {
        return db.query("SELECT *, to_char(t.due_date, $1) as due_date FROM task t WHERE assigned_member IS null AND task_status != 'Completed' ORDER BY t.due_date DESC", [dateFormat], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the available tasks");
            }
            return response.json({
                logged_in: true,
                is_admin: request.decodedToken.is_admin,
                tasks: res.rows
            });
        });
    }
    response.json({
        logged_in: false,
        is_admin: false
    });
}

exports.add = (request, response, next) => {
    if (request.decodedToken && request.decodedToken.is_admin) {
        let {
            task_title,
            due_date,
            assigned_member,
            task_status
        } = request.body;

        return db.query("INSERT INTO task (task_title, due_date, assigned_member, task_status) VALUES ($1, $2, $3, $4)", [task_title, due_date, assigned_member, task_status], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem adding this task");
            }
            successMsg(response);
        });
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.edit = (request, response, next) => {
    if (request.decodedToken) {
        let {
            edit_task_id,
            edit_task_title,
            edit_due_date,
            edit_assigned_member,
            edit_task_status
        } = request.body;

        return db.query("SELECT assigned_member FROM task WHERE task_id = $1", [edit_task_id], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting this task's owner");
            }
            let evaluator_id = res.rows[0].assigned_member;

            if (request.decodedToken.evauator_id = evaluator_id || request.decodedToken.is_admin) {
                return db.query("UPDATE task SET task_title = $1, due_date = $2, assigned_member = $3, task_status = $4 WHERE task_id = $5", [edit_task_title, edit_due_date, edit_assigned_member, edit_task_status, edit_task_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem editing this task");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 401, "Unauthorized");
            }
        });
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.signUpForTask = (request, response, next) => {
    if (request.decodedToken) {
        let {
            task_id
        } = request.body;

        return db.query("UPDATE task SET assigned_member = $1 WHERE task_id = $2", [request.decodedToken.evaluator_id, task_id], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem signing you up for this task");
            }
            successMsg(response);
        });
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.delete = (request, response, next) => {
    if (request.decodedToken && request.decodedToken.is_admin) {
        return db.query("DELETE FROM task WHERE task_id = $1;", [request.body.task_id], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem deleting this task");
            }
            successMsg(response);
        });
    }
    return handleNext(next, 401, "Unauthorized");
}

module.exports = exports;
