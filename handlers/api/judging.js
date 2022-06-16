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
      const values = [entry_id, evaluator_id, creativity, complexity, quality_code, interpretation, skill_level]
      return db.query("SELECT evaluate($1, $2, $3, $4, $5, $6, $7)", values, res => {
        if (res.error) {
          return handleNext(next, 400, "There was a problem evaluating this entry.", res.error);
        }
        return db.query("SELECT entry_level_locked FROM entry WHERE entry_id = $1", [entry_id], res => {
          if (res.error) {
            return handleNext(next, 500, "There was a problem checking whether this entry's skill level is locked.", res.error);
          }
          if (!res.rows[0].entry_level_locked) {
            return db.query("SELECT entry_author_kaid FROM entry WHERE entry_id = $1", [entry_id], res => {
              if (res.error) {
                return handleNext(next, 400, "There was a problem getting this entry's author.", res.error);
              }
              let authorKaid = res.rows[0].entry_author_kaid;

              return db.query("SELECT entry_level FROM entry WHERE entry_author_kaid = $1 AND entry_id != $2 ORDER BY entry_id DESC LIMIT 3", [authorKaid, entry_id], res => {
                if (res.error) {
                  return handleNext(next, 400, "There was a problem getting this user's past skill levels.", res.error);
                }
                let levels = res.rows;

                if (levels.length === 3 && levels[0].entry_level === "Advanced" && levels[1].entry_level === "Advanced" && levels[2].entry_level === "Advanced") {
                  return db.query("UPDATE entry SET entry_level = $1, entry_level_locked = true WHERE entry_id = $2", [levels[0].entry_level, entry_id], res => {
                    if (res.error) {
                      return handleNext(next, 400, "There was a problem updating this entry's skill level.", res.error);
                    }
                    successMsg(response);
                  });
                } else {
                  return db.query("SELECT update_entry_level($1)", [entry_id], res => {
                    if (res.error) {
                      return handleNext(next, 400, "There was a problem updating this entry's skill level.", res.error);
                    }
                    successMsg(response);
                  });
                }
              });
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

module.exports = exports;