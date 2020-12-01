/** Handler for EVALUATING an entry **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.submit = (request, response, next) => {
    if (request.decodedToken) {
        try {
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
                    return handleNext(next, 400, "There was a problem evaluating this entry");
                }
                return db.query("SELECT update_entry_level($1)", [entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem updating the entry's skill level");
                    }
                    successMsg(response);
                });
            });
        } catch (err) {
            return handleNext(next, 400, "There was a problem evaluating this entry");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.getJudgingCriteria = (request, response, next) => {
    if (request.decodedToken) {
        try {
            return db.query("SELECT criteria_name, criteria_description FROM judging_criteria WHERE is_active = true ORDER BY sort_order LIMIT 4", [], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting the judging criteria");
                }
                return response.json({
                    logged_in: true,
                    is_admin: request.decodedToken.is_admin,
                    judging_criteria: res.rows
                });
            });
        } catch (err) {
            return handleNext(next, 400, "There was a problem evaluating this entry");
        }
    } else {
        return response.json({
            logged_in: false,
            is_admin: false,
            judging_criteria: [
                {judging_criteria: "CREATIVITY", judging_description: "Does this program put an unexpected spin on the ordinary? Do they use shapes or ideas in cool ways?"},
                {judging_criteria: "COMPLEXITY", judging_description: "Does this program appear to have taken lots of work? Is the code complex or output intricate?"},
                {judging_criteria: "QUALITY CODE", judging_description: "Does this program have cleanly indented, commented code? Are there any syntax errors or program logic errors?"},
                {judging_criteria: "INTERPRETATION", judging_description: "Does this program portray the overall theme of the contest?"}
            ]
        });
    }
}

exports.getAllJudgingCriteria = (request, response, next) => {
    if (request.decodedToken) {
        if (request.decodedToken.is_admin) {
            return db.query("SELECT * FROM judging_criteria ORDER BY is_active DESC", [], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting the judging criteria");
                }
                return response.json({
                    logged_in: true,
                    is_admin: true,
                    judging_criteria: res.rows
                });
            });
        } else {
            return handleNext(next, 403, "Insufficient access");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.addJudgingCriteria = (request, response, next) => {
    if (request.decodedToken) {
        if (request.decodedToken.is_admin) {
            try {
                const {
                    criteria_name,
                    criteria_description,
                    is_active,
                    sort_order
                } = request.body;
                return db.query("INSERT INTO judging_criteria (criteria_name, criteria_description, is_active, sort_order) VALUES ($1, $2, $3, $4)", [criteria_name, criteria_description, is_active, sort_order], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem adding this criteria");
                    }
                    successMsg(response);
                });
            } catch (err) {
                return handleNext(next, 400, "There was a problem adding this criteria");
            }
        }
        handleNext(next, 403, "Insufficient access");
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.editJudgingCriteria = (request, response, next) => {
    if (request.decodedToken) {
        if (request.decodedToken.is_admin) {
            try {
                const {
                    criteria_id,
                    criteria_name,
                    criteria_description,
                    is_active,
                    sort_order
                } = request.body;
                return db.query("UPDATE judging_criteria SET criteria_name = $1, criteria_description = $2, is_active = $3, sort_order = $4 WHERE criteria_id = $5", [criteria_name, criteria_description, is_active, sort_order, criteria_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem editing this criteria");
                    }
                    successMsg(response);
                });
            } catch (err) {
                return handleNext(next, 400, "There was a problem editing this criteria");
            }
        }
        handleNext(next, 403, "Insufficient access");
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.deleteJudgingCriteria = (request, response, next) => {
    if (request.decodedToken) {
        if (request.decodedToken.is_admin) {
            try {
                const {
                    criteria_id
                } = request.body;
                return db.query("DELETE FROM judging_criteria WHERE criteria_id = $1", [criteria_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting this criteria");
                    }
                    successMsg(response);
                });
            } catch (err) {
                return handleNext(next, 400, "There was a problem deleting this criteria");
            }
        }
        handleNext(next, 403, "Insufficient access");
    }
    return handleNext(next, 401, "Unauthorized");
}


module.exports = exports;
