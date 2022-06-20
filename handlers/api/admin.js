/** Handler for admin STATS **/

const {
  handleNext,
  successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.setEntrySkillLevel = (request, response, next) => {
  try {
    if (request.decodedToken) {
      if (request.decodedToken.is_admin) {
        let { entry_level, entry_id } = request.body;

        return db.query("UPDATE entry SET entry_level = $1, entry_level_locked = true WHERE entry_id = $2", [entry_level, entry_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem setting the entry's skill level.", res.error);
          }
          successMsg(response);
        });
      } else {
        return handleNext(next, 403, "You do not have permission to set entry skill levels.");
      }
    } else {
      return handleNext(next, 401, "You must log in to set entry skill levels.");
    }
  } catch {
    return handleNext(next, 500, "Unexpected error while setting an entry's skill level.", error);
  }
}

module.exports = exports;