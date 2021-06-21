/** Handler for EVALUATING an entry **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.submit = (request, response, next) => {
    try {
        if (request.decodedToken && (request.decodedToken.permissions.judge_entries || request.decodedToken.is_admin)) {
            const {
                entry_id,
                creativity,
                complexity,
                quality_code,
                interpretation,
                skill_level
            } = request.body;
            const {
                evaluator_id,
                is_admin
            } = request.decodedToken;
            const values = [entry_id, evaluator_id, (creativity / 2), (complexity / 2), (quality_code / 2), (interpretation / 2), skill_level]
            return db.query("SELECT evaluate($1, $2, $3, $4, $5, $6, $7)", values, res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem evaluating this entry.", res.error);
                }
                return db.query("SELECT entry_level_locked FROM entry WHERE entry_id = $1", [entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 500, "There was a problem checking whether this entry's skill level is locked.", res.error);
                    }
                    if (!res.rows[0].entry_level_locked) {
                        return db.query("SELECT update_entry_level($1)", [entry_id], res => {
                            if (res.error) {
                                return handleNext(next, 400, "There was a problem updating this entry's skill level.", res.error);
                            }
                            successMsg(response);
                        });
                    } else {
                        successMsg(response);
                    }
                });
            });
        }
        return handleNext(next, 401, "You must log in to submit evaluations.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while evaluating this entry.", error);
    }
}

exports.getJudgingCriteria = (request, response, next) => {
    try {
        if (request.decodedToken && (request.decodedToken.permissions.judge_entries || request.decodedToken.is_admin)) {
            return db.query("SELECT criteria_name, criteria_description FROM judging_criteria WHERE is_active = true ORDER BY sort_order LIMIT 4", [], res => {
                if (res.error) {
                    return handleNext(next, 500, "There was a problem getting the judging criteria.", res.error);
                }
                return response.json({
                    logged_in: true,
                    is_admin: request.decodedToken.is_admin,
                    judging_criteria: res.rows
                });
            });
        } else {
            return response.json({
                logged_in: false,
                is_admin: false,
                judging_criteria: [
                    {criteria_name: "CREATIVITY", criteria_description: "Does this program put an unexpected spin on the ordinary? Do they use shapes or ideas in cool ways?"},
                    {criteria_name: "COMPLEXITY", criteria_description: "Does this program appear to have taken lots of work? Is the code complex or output intricate?"},
                    {criteria_name: "QUALITY CODE", criteria_description: "Does this program have cleanly indented, commented code? Are there any syntax errors or program logic errors?"},
                    {criteria_name: "INTERPRETATION", criteria_description: "Does this program portray the overall theme of the contest?"}
                ]
            });
        }
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while retrieving the judging criteria.", error);
    }
}

exports.getAllJudgingCriteria = (request, response, next) => {
    try {
        if (request.decodedToken) {
            if (request.decodedToken.permissions.view_judging_settings || request.decodedToken.is_admin) {
                return db.query("SELECT * FROM judging_criteria ORDER BY is_active DESC", [], res => {
                    if (res.error) {
                        return handleNext(next, 500, "There was a problem getting the judging criteria.", res.error);
                    }
                    return response.json({
                        logged_in: true,
                        is_admin: request.decodedToken.is_admin,
                        judging_criteria: res.rows
                    });
                });
            } else {
                return handleNext(next, 403, "You're not authorized to access the judging criteria.");
            }
        }
        return handleNext(next, 401, "You must log in to access the judging criteria.");
    } catch (error) {
        handleNext(next, 500, "Unexpected error while retrieving the judging criteria.", error);
    }
}

exports.addJudgingCriteria = (request, response, next) => {
    try {
        if (request.decodedToken) {
            if (request.decodedToken.permissions.manage_judging_criteria || request.decodedToken.is_admin) {
                const {
                    criteria_name,
                    criteria_description,
                    is_active,
                    sort_order
                } = request.body;
                return db.query("INSERT INTO judging_criteria (criteria_name, criteria_description, is_active, sort_order) VALUES ($1, $2, $3, $4)", [criteria_name, criteria_description, is_active, sort_order], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem adding this criterium.", res.error);
                    }
                    successMsg(response);
                });
            }
            return handleNext(next, 403, "You're not authorized to create judging criteria.");
        }
        return handleNext(next, 401, "You must log in to create judging criteria.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while adding a judging criterium.", error);
    }
}

exports.editJudgingCriteria = (request, response, next) => {
    try {
        if (request.decodedToken) {
            if (request.decodedToken.permissions.manage_judging_criteria || request.decodedToken.is_admin) {
                const {
                    criteria_id,
                    criteria_name,
                    criteria_description,
                    is_active,
                    sort_order
                } = request.body;
                return db.query("UPDATE judging_criteria SET criteria_name = $1, criteria_description = $2, is_active = $3, sort_order = $4 WHERE criteria_id = $5", [criteria_name, criteria_description, is_active, sort_order, criteria_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem editing this criterium.", res.error);
                    }
                    successMsg(response);
                });
            }
            return handleNext(next, 403, "You're not authorized to edit judging criteria.");
        }
        return handleNext(next, 401, "You must log in to edit judging criteria.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while editing judging criteria.", error);
    }
}

exports.deleteJudgingCriteria = (request, response, next) => {
    try {
        if (request.decodedToken) {
            if (request.decodedToken.permissions.manage_judging_criteria || request.decodedToken.is_admin) {
                const {
                    criteria_id
                } = request.body;
                return db.query("DELETE FROM judging_criteria WHERE criteria_id = $1", [criteria_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting this criterium.", res.error);
                    }
                    successMsg(response);
                });
            }
            return handleNext(next, 403, "You're not authorized to delete judging criteria.");
        }
        return handleNext(next, 401, "You must log in to delete judging criteria.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while deleting judging criteria.", error);
    }
}


module.exports = exports;
