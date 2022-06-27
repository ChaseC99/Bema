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

module.exports = exports;