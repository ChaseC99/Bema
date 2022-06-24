/** Handlers for ADDING, and DELETING contest winners **/

const {
  handleNext,
  successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

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
      } else if (request.decodedToken.permissions.judge_entries || request.decodedToken.is_admin) {
        return db.query("SELECT c.voting_enabled FROM contest c INNER JOIN entry e ON e.contest_id = c.contest_id WHERE e.entry_id = $1;", [entry_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem checking to see if voting is enabled for this contest.", res.error);
          }
          let voting_enabled = res.rows[0].voting_enabled;

          if (voting_enabled || request.decodedToken.is_admin) {
            return db.query("DELETE FROM entry_vote WHERE entry_id = $1 AND evaluator_id = $2", [entry_id, request.decodedToken.evaluator_id], res => {
              if (res.error) {
                return handleNext(next, 400, "There was a problem deleting your vote.", res.error);
              }
              successMsg(response);
            });
          } else {
            return handleNext(next, 403, "Voting is not enabled for this contest.");
          }
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