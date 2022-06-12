/** Handler for admin STATS **/

const {
  handleNext,
  successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.addEvaluatorGroup = (request, response, next) => {
  try {
    if (request.decodedToken) {
      let {
        group_name
      } = request.body;
      if (request.decodedToken.permissions.manage_judging_groups || request.decodedToken.is_admin) {
        return db.query("INSERT INTO evaluator_group (group_name, is_active) VALUES ($1, true)", [group_name], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem creating the evaluator groups.", res.error);
          }
          successMsg(response);
        });
      } else {
        return handleNext(next, 403, "You're not authorized to create evaluator groups.");
      }
    }
    return handleNext(next, 401, "You must log in to create an evaluator group.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while trying to create an evaluator group.", error);
  }
};

exports.editEvaluatorGroup = (request, response, next) => {
  try {
    if (request.decodedToken) {
      let {
        group_id,
        group_name,
        is_active
      } = request.body;
      if (request.decodedToken.permissions.manage_judging_groups || request.decodedToken.is_admin) {
        return db.query("UPDATE evaluator_group SET group_name = $1, is_active = $2 WHERE group_id = $3", [group_name, is_active, group_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem editing this evaluator group.", res.error);
          }
          successMsg(response);
        });
      } else {
        return handleNext(next, 403, "You're not authorized to edit evaluator groups.");
      }
    }
    return handleNext(next, 401, "You must log in to edit evaluator groups.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while editing an evaluator group.", error);
  }
};

exports.deleteEvaluatorGroup = (request, response, next) => {
  try {
    if (request.decodedToken) {
      let {
        group_id
      } = request.body;
      if (request.decodedToken.permissions.manage_judging_groups || request.decodedToken.is_admin) {
        // Unassign all entries and users assigned to this group
        return db.query("UPDATE entry SET assigned_group_id = null WHERE assigned_group_id = $1", [group_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem unassigning the entries in this evaluator group.", res.error);
          }
          return db.query("UPDATE evaluator SET group_id = null WHERE group_id = $1", [group_id], res => {
            if (res.error) {
              return handleNext(next, 400, "There was a problem unassigning the evaluators in this group.", res.error);
            }
            return db.query("DELETE FROM evaluator_group WHERE group_id = $1", [group_id], res => {
              if (res.error) {
                return handleNext(next, 400, "There was a problem deleting this evaluator group.", res.error);
              }
              successMsg(response);
            });
          });
        });
      } else {
        return handleNext(next, 403, "You're not authorized to delete evaluator groups.");
      }
    }
    return handleNext(next, 401, "You must log in to delete an evaluator group.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while deleting an evaluator group.", error);
  }
};

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