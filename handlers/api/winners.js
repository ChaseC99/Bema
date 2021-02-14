/** Handlers for ADDING, and DELETING contest winners **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.add = (request, response, next) => {
    try {
        if (request.decodedToken) {
            let {
                entry_id
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (request.decodedToken.permissions.manage_winners || is_admin) {
                return db.query("UPDATE entry SET is_winner = true WHERE entry_id = $1", [entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem adding this winner.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to add winners.");
            }
        }
        return handleNext(next, 401, "You must log in to add winners.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while adding a winner.", error);
    }
}

exports.delete = (request, response, next) => {
    try {
        if (request.decodedToken) {
            let {
                entry_id
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (request.decodedToken.permissions.manage_winners || is_admin) {
                return db.query("UPDATE entry SET is_winner = false WHERE entry_id = $1", [entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting this winner.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to delete winners.");
            }
        }
        return handleNext(next, 401, "You must log in to delete winners.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while deleting a winner.", error);
    }
}

exports.addVote = (request, response, next) => {
    try {
        if (request.decodedToken) {
            let {
                entry_id,
                feedback
            } = request.body;

            if (request.decodedToken.permissions.judge_entries || request.decodedToken.is_admin) {
                return db.query("INSERT INTO entry_vote (entry_id, evaluator_id, feedback) VALUES ($1, $2, $3);", [entry_id, request.decodedToken.evaluator_id, feedback], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem submitting your vote.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to vote for winners.");
            }
        }
        return handleNext(next, 401, "You must log in to vote for winners.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while adding a vote.", error);
    }
}

module.exports = exports;
