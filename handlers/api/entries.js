/** Handlers for GETTING, ADDING, EDITING, DELETING, and IMPORTING entries **/

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
        let contest_id = request.query.contestId;

        if (contest_id > 0) {
            // Send back all entry info
            if (request.decodedToken) {
                return db.query("SELECT e.entry_id, e.contest_id, e.entry_url, e.entry_kaid, e.entry_title, e.entry_author, e.entry_level, e.is_winner, e.assigned_group_id, e.flagged, e.disqualified, g.group_name, to_char(entry_created, $1) as entry_created FROM entry e LEFT JOIN evaluator_group g ON e.assigned_group_id = g.group_id WHERE e.contest_id = $2 ORDER BY e.entry_id", [displayFancyDateFormat, contest_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem getting the list of entries.", res.error);
                    }
                    return response.json({
                        logged_in: true,
                        is_admin: request.decodedToken.is_admin,
                        entries: res.rows
                    });
                });
            }
            return db.query("SELECT entry_id, contest_id, entry_url, entry_kaid, entry_title, entry_author, to_char(entry_created, $1) as entry_created FROM entry WHERE contest_id = $2 ORDER BY entry_id", [displayFancyDateFormat, contest_id], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting the list of entries.", res.error);
                }
                return response.json({
                    logged_in: false,
                    is_admin: false,
                    entries: res.rows
                });
            });
        }
        return handleNext(next, 400, "A valid contestId must be specified.", new Error("contestId is not valid."));
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while retrieving the list of entries.", error);
    }
};

exports.getFlagged = (request, response, next) => {
    try {
        if (request.decodedToken) {
            let {
                is_admin
            } = request.decodedToken;
            if (request.decodedToken.permissions.view_judging_settings || is_admin) {
                return db.query("SELECT *, to_char(entry_created, $1) as entry_created FROM entry WHERE flagged = true AND disqualified = false ORDER BY entry_id", [displayFancyDateFormat], res => {
                    if (res.error) {
                        return handleNext(next, 500, "There was a problem getting the flagged entries.", res.error);
                    }
                    return response.json({
                        logged_in: true,
                        is_admin: request.decodedToken.is_admin,
                        flaggedEntries: res.rows
                    });
                });
            } else {
                return handleNext(next, 403, "You're not authorized to access the list of flagged entries.");
            }
        }
        return handleNext(next, 401, "You must log in to access the list of flagged entries.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while retrieving the list of flagged entries.", error);
    }
};

exports.add = (request, response, next) => {
    try {
        if (request.decodedToken) {
            let {
                contest_id,
                entry_url,
                entry_kaid,
                entry_title,
                entry_author,
                entry_level,
                entry_votes,
                entry_created,
                entry_height
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (request.decodedToken.permissions.add_entries || is_admin) {
                return db.query("INSERT INTO entry (contest_id, entry_url, entry_kaid, entry_title, entry_author, entry_level, entry_votes, entry_created, entry_height) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);", [contest_id, entry_url, entry_kaid, entry_title, entry_author, entry_level, entry_votes, entry_created, entry_height], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem adding this entry.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to add new entries.");
            }
        }
        return handleNext(next, 401, "You must log in to add new entries.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while adding a new entry.", error);
    }
}

exports.edit = (request, response, next) => {
    try {
        if (request.decodedToken) {
            let {
                edit_entry_id,
                edit_entry_title,
                edit_entry_author,
                edit_entry_level,
                edit_entry_group,
                edit_flagged,
                edit_disqualified
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (request.decodedToken.permissions.edit_entries || is_admin) {
                return db.query("UPDATE entry SET entry_title = $1, entry_author = $2, entry_level = $3, assigned_group_id = $4, flagged = $5, disqualified = $6 WHERE entry_id = $7", [edit_entry_title, edit_entry_author, edit_entry_level, edit_entry_group, edit_flagged, edit_disqualified, edit_entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem editing this entry.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to edit entries.");
            }
        }
        return handleNext(next, 401, "You must log in to edit entries.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while editing an entry.", error);
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

            if (request.decodedToken.permissions.delete_entries || is_admin) {
                return db.query("DELETE FROM entry WHERE entry_id = $1", [entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting this entry.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to delete entries.");
            }
        }
        return handleNext(next, 401, "You must log in to delete an entry.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while deleting an entry.", error);
    }
}

exports.import = (request, response, next) => {
    try {
        if (request.decodedToken) {
            if (request.decodedToken.permissions.add_entries || request.decodedToken.is_admin) {
                let contest_id = request.body.contest_id;

                return db.query("SELECT * FROM contest WHERE contest_id = $1", [contest_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem finding this contest.", res.error);
                    }
                    let program_id = res.rows[0].contest_url.split("/")[5];

                    return Request(`https://www.khanacademy.org/api/internal/scratchpads/Scratchpad:${program_id}/top-forks?sort=2&page=0&limit=1000`, (err, res, body) => {
                        if (err) {
                            return handleNext(next, 500, "There was a problem retrieving the contest spin-offs.", err);
                        }

                        let data = JSON.parse(body);
                        if (data) {
                            return db.query("SELECT entry_kaid FROM entry WHERE contest_id = $1", [contest_id], res => {
                                if (res.error) {
                                    return handleNext(next, 400, "There was a problem getting the entry IDs for this contest.", res.error);
                                }
                                let entries = res.rows; // A list of existing entries

                                let query = "INSERT INTO entry (contest_id, entry_url, entry_kaid, entry_title, entry_author, entry_level, entry_votes, entry_created, entry_height) VALUES"; // Query to be ran later
                                let entryCount = 0; // Total number of new entries found

                                if (entries.length === 0) {
                                    // No entries exist for this contest, so import all spin-offs
                                    for (var i = 0; i < data.scratchpads.length; i++) {
                                        let program = data.scratchpads[i];

                                        if (entryCount === 0) {
                                            query += `(${contest_id}, '${program.url}', '${program.url.split("/")[5]}', '${program.title.replace(/\'/g,"\'\'").substring(0, 256)}', '${program.authorNickname.replace(/\'/g,"\'\'").substring(0, 256)}', 'TBD', ${program.sumVotesIncremented}, '${program.created}', 600)`;
                                        } else {
                                            query += `,(${contest_id}, '${program.url}', '${program.url.split("/")[5]}', '${program.title.replace(/\'/g,"\'\'").substring(0, 256)}', '${program.authorNickname.replace(/\'/g,"\'\'").substring(0, 256)}', 'TBD', ${program.sumVotesIncremented}, '${program.created}', 600)`;
                                        }
                                        entryCount++;
                                    }
                                } else {
                                    // Entries exist for the current contest, so check whether or not each entry has already been added
                                    for (var i = 0; i < data.scratchpads.length; i++) {
                                        let program = data.scratchpads[i];
                                        let programId = program.url.split("/")[5];
                                        let found = false;

                                        for (var j = 0; j < entries.length; j++) {
                                            if (entries[j].entry_kaid === programId) {
                                                found = true;
                                            }
                                        }

                                        // Add the spin-off if it isn't already in the database
                                        if (!found) {
                                            if (entryCount === 0) {
                                                query += `(${contest_id}, '${program.url}', '${program.url.split("/")[5]}', '${program.title.replace(/\'/g,"\'\'").substring(0, 256)}', '${program.authorNickname.replace(/\'/g,"\'\'").substring(0, 256)}', 'TBD', ${program.sumVotesIncremented}, '${program.created}', 600)`;
                                            } else {
                                                query += `,(${contest_id}, '${program.url}', '${program.url.split("/")[5]}', '${program.title.replace(/\'/g,"\'\'").substring(0, 256)}', '${program.authorNickname.replace(/\'/g,"\'\'").substring(0, 256)}', 'TBD', ${program.sumVotesIncremented}, '${program.created}', 600)`;
                                            }
                                            entryCount++;
                                        }
                                    }
                                }

                                // If new entries were found, run the query
                                if (entryCount > 0) {
                                    return db.query(query, [], res => {
                                        if (res.error) {
                                            return handleNext(next, 400, "There was a problem inserting the entries.", res.error);
                                        }
                                        successMsg(response, entryCount + " entries added");
                                    });
                                } else {
                                    successMsg(response, "No new entries to import");
                                }
                            });
                        } else {
                            return handleNext(next, 500, "No spin-off data was returned from Khan Academy.", new Error("No data returned."));
                        }
                    });
                });
            }
            return handleNext(next, 403, "You're not authorized to import entries.");
        }
        return handleNext(next, 401, "You must log in to import entries.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while importing entries.", error);
    }
}

exports.flag = (request, response, next) => {
    try {
        if (request.decodedToken && request.decodedToken.permissions.judge_entries) {
            let {
                entry_id
            } = request.body;

            return db.query("UPDATE entry SET flagged = true WHERE entry_id = $1", [entry_id], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem flagging this entry.", res.error);
                }
                successMsg(response);
            });
        }
        return handleNext(next, 401, "You must log in to flag an entry.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while flagging an entry.", error);
    }
}

exports.disqualify = (request, response, next) => {
    try {
        if (request.decodedToken) {
            let {
                entry_id
            } = request.body;

            let {
                is_admin
            } = request.decodedToken;

            if (request.decodedToken.permissions.edit_entries || is_admin) {
                return db.query("UPDATE entry SET disqualified = true WHERE entry_id = $1", [entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem disqualifying this entry.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to disqualify entries.");
            }
        }
        return handleNext(next, 401, "You must log in to disqualify an entry.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while disqualifying an entry.", error);
    }
}

exports.approve = (request, response, next) => {
    try {
        if (request.decodedToken) {
            let {
                entry_id
            } = request.body;

            let {
                is_admin
            } = request.decodedToken;

            if (request.decodedToken.permissions.edit_entries || is_admin) {
                return db.query("UPDATE entry SET disqualified = false, flagged = false WHERE entry_id = $1", [entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem approving this entry.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to approve flagged entries.");
            }
        }
        return handleNext(next, 401, "You must log in to approve a flagged entry.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while approving a flagged entry.", error);
    }
}

exports.assignToGroups = (request, response, next) => {
    try {
        if (request.decodedToken) {
            let {
                contest_id,
                assignAll
            } = request.body;

            let {
                is_admin
            } = request.decodedToken;

            if (request.decodedToken.permissions.assign_entry_groups || is_admin) {
                return db.query("SELECT group_id FROM evaluator_group WHERE is_active = true ORDER BY group_id", [], res => {
                    if (res.error) {
                        return handleNext(next, 500, "There was a problem selecting the evaluator groups.", res.error);
                    }
                    let groups = res.rows;
                    let query;

                    if (assignAll) {
                        query = "SELECT entry_id FROM entry WHERE contest_id = $1 ORDER BY entry_id";
                    } else {
                        query = "SELECT entry_id FROM entry WHERE contest_id = $1 AND assigned_group_id IS NULL ORDER BY entry_id";
                    }
                    return db.query(query, [contest_id], res => {
                        if (res.error) {
                            return handleNext(next, 400, "There was a problem selecting the entries for this contest.", res.error);
                        }
                        let entries = res.rows;

                        let entriesPerGroup = Math.floor(entries.length / groups.length);

                        // Assign entriesPerGroup entries to each group
                        for (var group = 0; group < groups.length; group++) {
                            for (var entry = 0 + entriesPerGroup * group; entry < entriesPerGroup * (group + 1); entry++) {
                                db.query("UPDATE entry SET assigned_group_id = $1 WHERE entry_id = $2", [groups[group].group_id, entries[entry].entry_id], res => {
                                    if (res.error) {
                                        return handleNext(next, 400, "There was a problem setting an entry's assigned group.", res.error);
                                    }
                                });
                            }
                        }

                        // Assign any remaining entries to the last group
                        for (var entry = entriesPerGroup * groups.length; entry < entries.length; entry++) {
                            db.query("UPDATE entry SET assigned_group_id = $1 WHERE entry_id = $2", [groups[groups.length - 1].group_id, entries[entry].entry_id], res => {
                                if (res.error) {
                                    return handleNext(next, 400, "There was a problem setting an entry's assigned group.", res.error);
                                }
                            });
                        }

                        successMsg(response);
                    });
                });
            }
            return handleNext(next, 403, "You're not authorized to assign entries to groups.");
        } else {
            return handleNext(next, 401, "You must log in to assign entries to groups.");
        }
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while assigning entries to groups.", error);
    }
}

exports.transferEntryGroups = (request, response, next) => {
    try {
        if (request.decodedToken) {
            let {
                contest_id,
                current_entry_group,
                new_entry_group
            } = request.body;

            let {
                is_admin
            } = request.decodedToken;

            if (request.decodedToken.permissions.assign_entry_groups || is_admin) {
                return db.query("UPDATE entry SET assigned_group_id = $1 WHERE assigned_group_id = $2 AND contest_id = $3", [new_entry_group, current_entry_group, contest_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem transfering the entry groups.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to transfer entry groups.");
            }
        }
        return handleNext(next, 401, "You must log in to transfer entry groups.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while transferring entry groups.", error);
    }
}

module.exports = exports;
