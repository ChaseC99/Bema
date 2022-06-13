/** Handlers for ADDING, EDITING, and DELETING messages **/

const {
  handleNext,
  successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.edit = (request, response, next) => {
  try {
    if (request.decodedToken) {
      let {
        message_id,
        message_title,
        message_content,
        public
      } = request.body;
      let {
        is_admin
      } = request.decodedToken;

      if (request.decodedToken.permissions.manage_announcements || is_admin) {
        return db.query("UPDATE messages SET message_title = $1, message_content = $2, public = $3 WHERE message_id = $4", [message_title, message_content, public, message_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem editing this message.", res.error);
          }
          successMsg(response);
        });
      } else {
        return handleNext(next, 403, "You're not authorized to edit this message.");
      }
    }
    return handleNext(next, 401, "You must log in to edit messages.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while editing an announcement message.", error);
  }
}

exports.delete = (request, response, next) => {
  try {
    if (request.decodedToken) {
      let {
        message_id
      } = request.body;
      let {
        is_admin
      } = request.decodedToken;

      if (request.decodedToken.permissions.manage_announcements || is_admin) {
        return db.query("DELETE FROM messages WHERE message_id = $1", [message_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem deleting this message.");
          }
          successMsg(response);
        });
      } else {
        return handleNext(next, 403, "You're not authorized to delete this message.");
      }
    }
    return handleNext(next, 401, "You must log in to delete messages.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while deleting an announcement message.", error);
  }
}

module.exports = exports;