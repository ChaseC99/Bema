/** Handler for admin STATS **/

const {
  handleNext,
  successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.stats = (request, response, next) => {
  try {
    if (request.decodedToken) {
      let { evaluator_id } = request.decodedToken;
      let yourReviewedEntriesCount, groupEntriesCount, groupEvaluatorCount, groupEvaluationsCount, totalEntriesCount, totalReviewedEntries, totalEvaluationsCount, totalActiveEvaluators, totalFlaggedEntries, totalDisqualifiedEntries;
      let evaluatorGroup;

      // Return private data to the logged in Council.
      return db.query("SELECT group_id FROM evaluator WHERE evaluator_id = $1", [evaluator_id], res => {
        if (res.error) {
          return handleNext(next, 400, "There was a problem getting your group ID.", res.error);
        }
        evaluatorGroup = res.rows[0].group_id;
        return db.query("SELECT COUNT(x.entry_id) as cnt FROM evaluation x INNER JOIN evaluator y ON y.evaluator_id = x.evaluator_id INNER JOIN entry z ON z.entry_id = x.entry_id	WHERE x.evaluation_complete = true AND z.contest_id = (SELECT MAX(a.contest_id) FROM contest a) AND x.evaluator_id = $1 AND z.assigned_group_id = $2 AND z.disqualified = false GROUP BY (y.evaluator_name) ORDER BY cnt DESC;", [evaluator_id, evaluatorGroup], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem getting your evaluation count.", res.error);
          }
          // If length > 0, true, else false.
          if (res.rows.length) {
            yourReviewedEntriesCount = parseInt(res.rows[0].cnt);
          } else {
            yourReviewedEntriesCount = 0;
          }

          return db.query("SELECT COUNT(*) FROM entry WHERE assigned_group_id = $1 AND disqualified = false AND contest_id = (SELECT MAX(a.contest_id) FROM contest a)", [evaluatorGroup], res => {
            if (res.error) {
              return handleNext(next, 400, "There was a problem getting your group entries.", res.error);
            }
            if (res.rows.length) {
              groupEntriesCount = parseInt(res.rows[0].count);
            } else {
              groupEntriesCount = 0;
            }
            return db.query("SELECT COUNT(*) FROM evaluator WHERE group_id = $1 AND account_locked = false", [evaluatorGroup], res => {
              if (res.error) {
                return handleNext(next, 400, "There was a problem getting the evaluator count in your group.", res.error);
              }
              if (res.rows.length) {
                groupEvaluatorCount = parseInt(res.rows[0].count);
              } else {
                groupEvaluatorCount = 0;
              }
              return db.query("SELECT COUNT(x.entry_id) as cnt FROM evaluation x INNER JOIN entry z ON z.entry_id = x.entry_id INNER JOIN evaluator_group y ON y.group_id = z.assigned_group_id WHERE x.evaluation_complete = true AND z.contest_id = (SELECT MAX(a.contest_id) FROM contest a) AND z.disqualified = false AND y.group_id = $1;", [evaluatorGroup], res => {
                if (res.error) {
                  return handleNext(next, 400, "There was a problem getting the evaluation count in your group.", res.error);
                }
                if (res.rows.length) {
                  groupEvaluationsCount = parseInt(res.rows[0].cnt);
                } else {
                  groupEvaluationsCount = 0;
                }

                if (request.decodedToken.permissions.view_admin_stats || request.decodedToken.is_admin) {
                  return db.query("SELECT COUNT(*) FROM entry WHERE contest_id = (SELECT MAX(a.contest_id) FROM contest a) AND disqualified = false", [], res => {
                    if (res.error) {
                      return handleNext(next, 400, "There was a problem getting the total entries for the current contest.", res.error);
                    }
                    if (res.rows.length) {
                      totalEntriesCount = parseInt(res.rows[0].count);
                    } else {
                      totalEntriesCount = 0;
                    }
                    return db.query("SELECT COUNT(*) FROM evaluation ev INNER JOIN entry en ON ev.entry_id = en.entry_id WHERE en.contest_id = (SELECT MAX(a.contest_id) FROM contest a) AND ev.evaluation_complete = true AND en.disqualified = false GROUP BY en.entry_id;", [], res => {
                      if (res.error) {
                        return handleNext(next, 400, "There was a problem getting the reviewed entries for the current contest.", res.error);
                      }
                      if (res.rows.length) {
                        totalReviewedEntries = res.rows.length;
                      } else {
                        totalReviewedEntries = 0;
                      }
                      return db.query("SELECT COUNT(*) FROM evaluation ev INNER JOIN entry en ON en.entry_id = ev.entry_id WHERE en.contest_id = (SELECT MAX(a.contest_id) FROM contest a) AND ev.evaluation_complete = true AND en.disqualified = false", [], res => {
                        if (res.error) {
                          return handleNext(next, 400, "There was a problem getting the evaluation count for the current contest.", res.error);
                        }
                        if (res.rows.length) {
                          totalEvaluationsCount = parseInt(res.rows[0].count);
                        } else {
                          totalEvaluationsCount = 0;
                        }
                        return db.query("SELECT COUNT(*) FROM evaluator ev INNER JOIN evaluator_group eg ON ev.group_id = eg.group_id WHERE ev.account_locked = false AND eg.is_active = true", [], res => {
                          if (res.error) {
                            return handleNext(next, 400, "There was a problem getting the active evaluators.", res.error);
                          }
                          if (res.rows.length) {
                            totalActiveEvaluators = parseInt(res.rows[0].count);
                          } else {
                            totalActiveEvaluators = 0;
                          }
                          return db.query("SELECT COUNT(*) FROM entry WHERE contest_id = (SELECT MAX(a.contest_id) FROM contest a) AND flagged = true AND disqualified = false", [], res => {
                            if (res.error) {
                              return handleNext(next, 400, "There was a problem getting the flagged entries for the current contest.", res.error);
                            }
                            if (res.rows.length) {
                              totalFlaggedEntries = parseInt(res.rows[0].count);
                            } else {
                              totalFlaggedEntries = 0;
                            }
                            return db.query("SELECT COUNT(*) FROM entry WHERE contest_id = (SELECT MAX(a.contest_id) FROM contest a) AND disqualified = true", [], res => {
                              if (res.error) {
                                return handleNext(next, 400, "There was a problem getting the disqualified entries for the current contest.", res.error);
                              }
                              if (res.rows.length) {
                                totalDisqualifiedEntries = parseInt(res.rows[0].count);
                              } else {
                                totalDisqualifiedEntries = 0;
                              }
                              return db.query("SELECT y.nickname, CAST(AVG(z.assigned_group_id) as int) as group_id, CAST(COUNT(x.entry_id) as INTEGER) as eval_count FROM evaluation x INNER JOIN evaluator y ON y.evaluator_id = x.evaluator_id INNER JOIN entry z ON z.entry_id = x.entry_id WHERE x.evaluation_complete = true AND z.contest_id = (SELECT MAX(a.contest_id) FROM contest a) AND z.disqualified = false GROUP BY (y.nickname)", [], res => {
                                if (res.error) {
                                  return handleNext(next, 400, "There was a problem getting the evaluations per evaluator.", res.error);
                                }
                                evaluationsPerEvaluator = res.rows;
                                return db.query("SELECT assigned_group_id as group_id, CAST(COUNT(*) as INTEGER) as entry_count FROM entry WHERE contest_id = (SELECT MAX(a.contest_id) FROM contest a) AND disqualified = false GROUP BY assigned_group_id;", [], res => {
                                  if (res.error) {
                                    return handleNext(next, 400, "There was a problem getting the entries per group.", res.error);
                                  }
                                  entriesPerGroup = res.rows;
                                  return response.json({
                                    yourReviewedEntriesCount,
                                    groupEntriesCount,
                                    groupEvaluatorCount,
                                    groupEvaluationsCount,
                                    totalEntriesCount,
                                    totalReviewedEntries,
                                    totalEvaluationsCount,
                                    totalActiveEvaluators,
                                    totalFlaggedEntries,
                                    totalDisqualifiedEntries,
                                    evaluationsPerEvaluator,
                                    entriesPerGroup,
                                    logged_in: true,
                                    is_admin: request.decodedToken.is_admin
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                } else {
                  return response.json({
                    yourReviewedEntriesCount,
                    groupEntriesCount,
                    groupEvaluatorCount,
                    groupEvaluationsCount,
                    logged_in: true,
                    is_admin: false
                  });
                }
              });
            });
          });
        });
      });
    }
    // Dumby data for public presentation that cannot contain private data.
    return response.json({
      yourReviewedEntriesCount: 10,
      groupEntriesCount: 50,
      groupEvaluatorCount: 3,
      groupEvaluationsCount: 80,
      logged_in: false,
      is_admin: false
    });
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while retrieving statistics for the current contest.", error);
  }
};

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