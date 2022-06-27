/** Handlers GETTING, ADDING, EDITING, and DELETING users. **/

const {
  handleNext,
  successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.assignToEvaluatorGroup = (request, response, next) => {
  try {
    if (request.decodedToken) {
      let {
        evaluator_id,
        group_id
      } = request.body;
      let {
        is_admin
      } = request.decodedToken;

      if (request.decodedToken.permissions.assign_evaluator_groups || is_admin) {
        return db.query("UPDATE evaluator SET group_id = $1 WHERE evaluator_id = $2", [group_id, evaluator_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem assigning this user to an evaluator group.", res.error);
          }
          successMsg(response);
        });
      } else {
        return handleNext(next, 403, "You're not authorized to assign this user to an evaluator group.");
      }
    }
    return handleNext(next, 401, "You must log in to assign a user to an evaluator group.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while assigning a user to an evaluator group.", error);
  }
}

exports.editPermissions = (request, response, next) => {
  try {
    if (request.decodedToken) {
      let {
        evaluator_id,
        view_admin_stats,
        edit_contests,
        delete_contests,
        edit_entries,
        delete_entries,
        add_entries,
        assign_entry_groups,
        view_all_evaluations,
        edit_all_evaluations,
        delete_all_evaluations,
        manage_winners,
        view_all_tasks,
        edit_all_tasks,
        delete_all_tasks,
        view_judging_settings,
        manage_judging_groups,
        assign_evaluator_groups,
        manage_judging_criteria,
        view_all_users,
        edit_user_profiles,
        change_user_passwords,
        assume_user_identities,
        add_users,
        view_errors,
        delete_errors,
        judge_entries,
        edit_kb_content,
        delete_kb_content,
        publish_kb_content,
        manage_announcements
      } = request.body;
      let {
        is_admin
      } = request.decodedToken;

      if (is_admin) {
        return db.query("UPDATE evaluator_permissions SET view_admin_stats = $2, edit_contests = $3, delete_contests = $4, edit_entries = $5, delete_entries = $6, add_entries = $7, assign_entry_groups = $8, view_all_evaluations = $9, edit_all_evaluations = $10, delete_all_evaluations = $11, manage_winners = $12, view_all_tasks = $13, edit_all_tasks = $14, delete_all_tasks = $15, view_judging_settings = $16, manage_judging_groups = $17, assign_evaluator_groups = $18, manage_judging_criteria = $19, view_all_users = $20, edit_user_profiles = $21, change_user_passwords = $22, assume_user_identities = $23, add_users = $24, view_errors = $25, delete_errors = $26, judge_entries = $27, edit_kb_content = $28, delete_kb_content = $29, publish_kb_content = $30, manage_announcements = $31 WHERE evaluator_id = $1", [evaluator_id, view_admin_stats, edit_contests, delete_contests, edit_entries, delete_entries, add_entries, assign_entry_groups, view_all_evaluations, edit_all_evaluations, delete_all_evaluations, manage_winners, view_all_tasks, edit_all_tasks, delete_all_tasks, view_judging_settings, manage_judging_groups, assign_evaluator_groups, manage_judging_criteria, view_all_users, edit_user_profiles, change_user_passwords, assume_user_identities, add_users, view_errors, delete_errors, judge_entries, edit_kb_content, delete_kb_content, publish_kb_content, manage_announcements], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem with updating this user's permissions.", res.error);
          }
          return db.query("UPDATE evaluator SET force_update = true WHERE evaluator_id = $1", [evaluator_id], res => {
            if (res.error) {
              return handleNext(next, 400, "There was a problem with updating this user's permissions.", res.error);
            }
            successMsg(response);
          });
        });
      } else {
        return handleNext(next, 403, "You're not authorized to edit user permissions.");
      }
    }
    return handleNext(next, 401, "You must log in to edit user permissions.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while updating user permissions.", error);
  }
}

module.exports = exports;