/** Handlers for GETTING, ADDING, EDITING, DELETING, and IMPORTING entries **/

const {
  handleNext,
  successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const Request = require("request");

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