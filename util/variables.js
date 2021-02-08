/** Utility variables **/

// ReGeX patterns
exports.kaidPattern = /^kaid\_[0-9]+$/;
exports.datePattern = /^(0?[1-9]|1[0-2])-(0?[1-9]|[1-2][0-9]|3[0-1])-[0-9]{4}$/;
exports.dateFormat = "MM-DD-YYYY";
exports.displayDateFormat = "FMMM-FMDD-YYYY";
exports.displayFancyDateFormat = "FMMM-FMDD-YYYY FMHH12:FMMI:FMSS AM";

// Character limits
exports.scoreChars = {
    min: 0,
    max: 10
};
exports.messageChars = {
    min: 1,
    max: 100
};
exports.nameChars = {
    min: 1,
    max: 200
};
exports.contentChars = {
    min: 1,
    max: 5000
};

// Lists
exports.scores = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
exports.skillLevels = ["Advanced", "Intermediate", "Beginner", "TBD"];
exports.taskStatuses = ["Not Started", "Started", "Completed"];
exports.visibilities = ["Public", "Evaluators Only", "Admins Only"];

exports.publicPermissions = {
    view_admin_stats: false,
    edit_contests: false,
    delete_contests: false,
    edit_entries: false,
    delete_entries: false,
    add_entries: false,
    assign_entry_groups: false,
    view_all_evaluations: false,
    edit_all_evaluations: false,
    delete_all_evaluations: false,
    manage_winners: false,
    view_all_tasks: false,
    edit_all_tasks: false,
    delete_all_tasks: false,
    view_judging_settings: false,
    manage_judging_groups: false,
    assign_evaluator_groups: false,
    manage_judging_criteria: false,
    view_all_users: false,
    edit_user_profiles: false,
    change_user_passwords: false,
    assume_user_identities: false,
    add_users: false,
    view_errors: false,
    delete_errors: false,
    judge_entries: false,
    edit_kb_content: false,
    delete_kb_content: false,
    publish_kb_content: false,
    manage_announcements: false
};

module.exports = exports;
