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
    handleNext(next, 401, "Unauthorized");
}

exports.getJudgingCriteria = (request, response, next) => {
    if (request.decodedToken) {
        try {
            return db.query("SELECT criteria_name, criteria_description FROM judging_criteria WHERE is_active = true ORDER BY sort_order", [], res => {
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

module.exports = exports;
