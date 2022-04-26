/** Handlers for ADDING, EDITING, and DELETING messages **/

const {
  handleNext,
  successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const { displayDateFormat } = require(process.cwd() + "/util/variables");
const nodemailer = require('nodemailer');

exports.get = (request, response, next) => {
  try {
    if (request.decodedToken) {
      return db.query("SELECT *, to_char(m.message_date, $1) as message_date FROM messages m ORDER BY m.message_date DESC", [displayDateFormat], res => {
        if (res.error) {
          return handleNext(next, 400, "There was a problem getting the messages.", res.error);
        }
        response.json({
          logged_in: true,
          is_admin: request.decodedToken.is_admin,
          messages: res.rows
        });
      });
    }
    return db.query("SELECT *, to_char(m.message_date, $1) as message_date FROM messages m WHERE public = true ORDER BY m.message_date DESC", [displayDateFormat], res => {
      if (res.error) {
        return handleNext(next, 400, "There was a problem getting the public messages.", res.error);
      }
      response.json({
        logged_in: false,
        is_admin: false,
        messages: res.rows
      });
    });
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while retriving messages.", error);
  }
};

exports.add = (request, response, next) => {
  try {
    if (request.decodedToken) {
      let {
        message_title,
        message_content,
        public,
      } = request.body;
      let {
        is_admin,
        evaluator_name
      } = request.decodedToken;

      if (request.decodedToken.permissions.manage_announcements || is_admin) {

        return db.query("INSERT INTO messages (message_author, message_date, message_title, message_content, public) VALUES ($1, $2, $3, $4, $5);", [evaluator_name, new Date(), message_title, message_content, public], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem adding this message.", res.error);
          }

          //   if (send_email) {
          //     return db.query("SELECT email FROM evaluator WHERE email LIKE '%@%' AND receive_emails = true AND account_locked = false;", [], res => {
          //       if (res.error) {
          //         return handleNext(next, 400, "There was a problem sending notification emails.", res.error);
          //       }

          //       let emails = res.rows;
          //       let emailList = '';
          //       for (var i = 0; i < emails.length; i++) {
          //         emailList += emails[i].email;

          //         if (i != emails.length - 1) {
          //           emailList += ", ";
          //         }
          //       }

          //       var transporter = nodemailer.createTransport({
          //         service: email_address.split("@")[1].split(".")[0],
          //         auth: {
          //           user: email_address,
          //           pass: password
          //         }
          //       });

          //       var mailOptions = {
          //         from: email_address,
          //         to: email_address,
          //         bcc: emailList,
          //         subject: "[KACP Challenge Council] " + message_title,
          //         html: message_content
          //       };

          //       transporter.sendMail(mailOptions, function(error, info) {
          //         if (error) {
          //           return handleNext(next, 400, error);
          //         }
          //       });

          //       successMsg(response);
          //     });
          //   }
          successMsg(response);
        });
      } else {
        return handleNext(next, 403, "You're not authorized to create announcement messages.");
      }
    }
    return handleNext(next, 401, "You must log in to create announcement messages.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while creating an announcement message.", error);
  }
}

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