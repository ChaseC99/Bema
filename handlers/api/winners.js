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

exports.getVotes = (request, response, next) => {
    try {
        let entryId = parseInt(request.query.entryId);
        let contestId = parseInt(request.query.contestId);

        if (request.decodedToken) {
            if (contestId > 0) {
                return db.query("SELECT v.vote_id, v.entry_id, v.evaluator_id, v.feedback, z.nickname FROM entry_vote v INNER JOIN entry e ON e.entry_id = v.entry_id INNER JOIN evaluator z ON z.evaluator_id = v.evaluator_id WHERE e.contest_id = $1;", [contestId], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem getting the entry votes for this contest.", res.error);
                    }
                    return response.json({
                        logged_in: true,
                        is_admin: request.decodedToken.is_admin,
                        votes: res.rows
                    });
                });
            } else if (entryId > 0) {
                return db.query("SELECT v.vote_id, v.entry_id, v.evaluator_id, v.feedback, z.nickname FROM entry_vote v INNER JOIN evaluator z ON z.evaluator_id = v.evaluator_id WHERE v.entry_id = $1;", [entryId], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem getting the votes for this entry.", res.error);
                    }
                    return response.json({
                        logged_in: true,
                        is_admin: request.decodedToken.is_admin,
                        votes: res.rows
                    });
                });
            }
            return handleNext(next, 400, "Invalid Input: entryId or contestId must be specified.", new Error("entryId and contestId were not specified."));
        }
        return handleNext(next, 401, "You must log in to retrieve entry votes.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while retrieving entry votes.", error);
    }
};

exports.addVote = (request, response, next) => {
    try {
        if (request.decodedToken) {
            let {
                entry_id,
                feedback
            } = request.body;

            if (request.decodedToken.permissions.judge_entries || request.decodedToken.is_admin) {
                return db.query("SELECT COUNT(*) FROM entry_vote WHERE entry_id = $1 AND evaluator_id = $2", [entry_id, request.decodedToken.evaluator_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem submitting your vote.", res.error);
                    }
                    let count = res.rows[0].count;

                    if (count < 1) {
                        return db.query("INSERT INTO entry_vote (entry_id, evaluator_id, feedback) VALUES ($1, $2, $3);", [entry_id, request.decodedToken.evaluator_id, feedback], res => {
                            if (res.error) {
                                return handleNext(next, 400, "There was a problem submitting your vote.", res.error);
                            }
                            successMsg(response);
                        });
                    } else {
                        return handleNext(next, 403, "You can't vote for the same entry more than once.");
                    }
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

exports.deleteVote = (request, response, next) => {
    try {
        if (request.decodedToken) {
            let {
                vote_id,
                entry_id
            } = request.body;

            if (vote_id > 0 && request.decodedToken.is_admin) {
                return db.query("DELETE FROM entry_vote WHERE vote_id = $1", [vote_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting this vote.", res.error);
                    }
                    successMsg(response);
                });
            }
            else if (request.decodedToken.permissions.judge_entries || request.decodedToken.is_admin) {
                return db.query("DELETE FROM entry_vote WHERE entry_id = $1 AND evaluator_id = $2", [entry_id, request.decodedToken.evaluator_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting your vote.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to delete votes.");
            }
        }
        return handleNext(next, 401, "You must log in to vote for winners.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while adding a vote.", error);
    }
}

module.exports = exports;
