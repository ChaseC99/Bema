/** Handlers for GETTING, ADDING, EDITING, and DELETING tasks. **/

const { handleNext, successMsg } = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const dateFormat = "FMMM-FMDD-YYYY";

exports.get = (request, response, next) => {
    try {
        if (request.decodedToken && request.decodedToken.is_admin) {
            return db.query("SELECT t.task_id, t.task_title, t.task_status, t.assigned_member, evaluator.evaluator_name, to_char(t.due_date, $1) as due_date FROM task t LEFT JOIN evaluator ON t.assigned_member = evaluator.evaluator_id;", [dateFormat], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting all the tasks.", res.error);
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
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while retrieving the list of tasks.", error);
    }
}

exports.getForUser = (request, response, next) => {
    try {
        if (request.decodedToken) {
            return db.query("SELECT *, to_char(t.due_date, $1) as due_date FROM task t WHERE assigned_member = $2 AND task_status != 'Completed' ORDER BY t.due_date DESC", [dateFormat, request.decodedToken.evaluator_id], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting tasks for this user.", res.error);
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
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while getting tasks for a user.", error);
    }
}

exports.getAvailable = (request, response, next) => {
    try {
        if (request.decodedToken) {
            return db.query("SELECT *, to_char(t.due_date, $1) as due_date FROM task t WHERE assigned_member IS null AND task_status != 'Completed' ORDER BY t.due_date DESC", [dateFormat], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting the available tasks.", res.error);
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
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while getting the available tasks.", error);
    }
}

exports.add = (request, response, next) => {
    try {
        if (request.decodedToken) {
            if (request.decodedToken.is_admin) {
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

            return db.query("SELECT assigned_member FROM task WHERE task_id = $1", [edit_task_id], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting this task's owner.", res.error);
                }
                let evaluator_id = res.rows[0].assigned_member;

                if (request.decodedToken.evauator_id = evaluator_id || request.decodedToken.is_admin) {
                    return db.query("UPDATE task SET task_title = $1, due_date = $2, assigned_member = $3, task_status = $4 WHERE task_id = $5", [edit_task_title, edit_due_date, edit_assigned_member, edit_task_status, edit_task_id], res => {
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
            if (request.decodedToken.is_admin) {
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
