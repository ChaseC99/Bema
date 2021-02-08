/** Handlers for GETTING, EDITING, and DELETING evaluations **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const Request = require("request");
const Moment = require("moment");
const { displayFancyDateFormat } = require(process.cwd() + "/util/variables");

exports.get = (request, response, next) => {
    try {
        let userId = parseInt(request.query.userId);
        let contestId = request.query.contestId;

        if (request.decodedToken) {
            if (userId && contestId) {
                if (userId === request.decodedToken.evaluator_id || request.decodedToken.permissions.view_all_evaluations || request.decodedToken.is_admin) {
                    return db.query("SELECT evn.evaluation_id, evn.entry_id, evn.creativity, evn.complexity, evn.execution, evn.interpretation, evn.evaluation_level, en.entry_title, en.entry_url FROM evaluation evn INNER JOIN evaluator evl ON evn.evaluator_id = evl.evaluator_id INNER JOIN entry en ON en.entry_id = evn.entry_id WHERE evn.evaluation_complete = true AND en.contest_id = $1 AND evn.evaluator_id = $2;", [contestId, userId], res => {
                        if (res.error) {
                            return handleNext(next, 400, "There was a problem getting this user's evaluations for the given contest.", res.error);
                        }
                        return response.json({
                            logged_in: true,
                            is_admin: request.decodedToken.is_admin,
                            evaluations: res.rows
                        });
                    });
                }
                return handleNext(next, 403, "You're not authorized to access another user's evaluations.");
            }
            return handleNext(next, 400, "Invalid Inputs: userId and contestId expected.", new Error("userId and contestId were not specified."));
        }
        return handleNext(next, 401, "You must log in to retrieving this user's evaluations.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while retrieving this user's evaluations.", error);
    }
};

exports.put = (request, response, next) => {
    try {
        if (request.decodedToken) {
            let {
                edit_evaluation_id,
                edit_entry_id,
                edit_creativity,
                edit_complexity,
                edit_execution,
                edit_interpretation,
                edit_evaluation_level
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            // Get the user to whom this evaluation belongs to
            return db.query("SELECT evaluator_id FROM evaluation WHERE evaluation_id = $1", [edit_evaluation_id], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting this evaluation's owner.", res.error);
                }

                let owner = res.rows[0].evaluator_id;

                // Get the current contest id
                return db.query("SELECT contest_id FROM contest ORDER BY contest_id DESC LIMIT 1", [], res => {
                    let current_contest = res.rows[0].contest_id;

                    // Get the contest associated with this evaluation
                    return db.query("SELECT en.contest_id FROM evaluation ev INNER JOIN entry en ON en.entry_id = ev.entry_id WHERE evaluation_id = $1;", [edit_evaluation_id], res => {
                        let ev_contest_id = res.rows[0].contest_id;

                        // Make sure requester owns this evaluation, and that the evaluation is for the current contest
                        if ((owner === request.decodedToken.evaluator_id && current_contest === ev_contest_id) || request.decodedToken.permissions.edit_all_evaluations || is_admin) {
                            return db.query("UPDATE evaluation SET creativity = $1, complexity = $2, execution = $3, interpretation = $4, evaluation_level = $5 WHERE evaluation_id = $6", [edit_creativity, edit_complexity, edit_execution, edit_interpretation, edit_evaluation_level, edit_evaluation_id], res => {
                                if (res.error) {
                                    return handleNext(next, 400, "There was a problem editing this evaluation.", res.error);
                                }
                                return db.query("SELECT update_entry_level($1)", [edit_entry_id], res => {
                                    if (res.error) {
                                        return handleNext(next, 400, "There was a problem updating this entry's skill level.", res.error);
                                    }


                                    successMsg(response);
                                });
                            });
                        } else {
                            return handleNext(next, 403, "You're not authorized to edit this evaluation.");
                        }
                    });
                });
            });
        }
        return handleNext(next, 401, "You must log in to edit evaluations.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while editing this evaluation.", error);
    }
};

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
