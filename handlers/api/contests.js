/** Handlers for GETTING, ADDING, EDITING, and DELETING contests **/

const {
  handleNext,
  successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.add = (request, response, next) => {
  try {
    if (request.decodedToken) {
      let {
        contest_name,
        contest_url,
        contest_author,
        contest_start_date,
        contest_end_date,
        contest_current
      } = request.body;
      let {
        is_admin
      } = request.decodedToken;

      if (request.decodedToken.permissions.edit_contests || is_admin) {
        return db.query("INSERT INTO contest (contest_name, contest_url, contest_author, date_start, date_end, current) VALUES ($1, $2, $3, $4, $5, $6)", [contest_name, contest_url, contest_author, contest_start_date, contest_end_date, contest_current], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem creating a new contest.", res.error);
          }
          successMsg(response);
        });
      } else {
        return handleNext(next, 403, "You're not authorized to create new contests.");
      }
    }
    return handleNext(next, 401, "You must log in to create a new contest.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while creating a new contest.", error);
  }
}

exports.edit = (request, response, next) => {
  try {
    if (request.decodedToken) {
      if (request.decodedToken.permissions.edit_contests || request.decodedToken.is_admin) {
        let {
          edit_contest_id,
          edit_contest_name,
          edit_contest_url,
          edit_contest_author,
          edit_contest_start_date,
          edit_contest_end_date,
          edit_contest_current,
          edit_voting_enabled,
          edit_badge_name,
          edit_badge_image_url
        } = request.body;
        return db.query("UPDATE contest SET contest_name = $1, contest_url = $2, contest_author = $3, date_start = $4, date_end = $5, current = $6, voting_enabled = $7, badge_name = $8, badge_image_url = $9 WHERE contest_id = $10", [edit_contest_name, edit_contest_url, edit_contest_author, edit_contest_start_date, edit_contest_end_date, edit_contest_current, edit_voting_enabled, edit_badge_name, edit_badge_image_url, edit_contest_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem editing this contest.", res.error);
          }
          successMsg(response);
        });
      } else {
        return handleNext(next, 403, "You're not authorized to edit contests.");
      }
    }
    return handleNext(next, 401, "You must log in to edit a contest.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while editing a contest.", error);
  }
}

exports.delete = (request, response, next) => {
  try {
    if (request.decodedToken) {
      if (request.decodedToken.permissions.delete_contests || request.decodedToken.is_admin) {
        let {
          contest_id
        } = request.body;
        return db.query("DELETE FROM contest WHERE contest_id = $1", [contest_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem deleting this contest.", res.error);
          };
          successMsg(response);
        });
      } else {
        return handleNext(next, 403, "You're not authorized to delete contests.");
      }
    }
    return handleNext(next, 401, "You must log in to delete a contest.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while deleting a contest.", error);
  }
}

module.exports = exports;