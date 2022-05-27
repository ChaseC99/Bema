const express = require("express");
const router = express.Router();
const hasBody = require(process.cwd() + "/middleware/hasBody");
const { check, oneOf } = require('express-validator/check');
const wasValidated = require(process.cwd() + "/middleware/wasValidated");
const { nameChars, datePattern, kaidPattern, dateFormat, scoreChars, messageChars, contentChars, scores, skillLevels, taskStatuses, visibilities } = require(process.cwd() + "/util/variables");

const admin = require(process.cwd() + "/handlers/api/admin");
const contests = require(process.cwd() + "/handlers/api/contests");
const contestants = require(process.cwd() + "/handlers/api/contestants");
const entries = require(process.cwd() + "/handlers/api/entries");
const results = require(process.cwd() + "/handlers/api/results");
const judging = require(process.cwd() + "/handlers/api/judging");
const messages = require(process.cwd() + "/handlers/api/messages");
const users = require(process.cwd() + "/handlers/api/users");
const winners = require(process.cwd() + "/handlers/api/winners");
const tasks = require(process.cwd() + "/handlers/api/tasks");
const evaluations = require(process.cwd() + "/handlers/api/evaluations");
const kb = require(process.cwd() + "/handlers/api/knowledge-base");
const errors = require(process.cwd() + "/handlers/api/errors");

const routeChecks = {
  admin: {
    addEvaluatorGroup: [
      check("group_name")
      .isLength(nameChars)
      .withMessage("Group name cannot be empty or longer than 200 characters")
    ],
    editEvaluatorGroup: [
      check("group_id")
      .isInt()
      .withMessage("Group ID must be an integer"),
      check("group_name")
      .isLength(nameChars)
      .withMessage("Group name cannot be empty or longer than 200 characters"),
      check("is_active")
      .isBoolean()
      .withMessage("is_active must be a boolean")
    ],
    deleteEvaluatorGroup: [
      check("group_id")
      .isInt()
      .withMessage("Group ID must be an integer")
    ],
    setEntrySkillLevel: [
      check("entry_level")
      .isIn(skillLevels)
      .withMessage("Entry level must be 'Advanced', 'Intermediate', 'Beginner', or 'TBD'"),
      check("entry_id")
      .isInt()
      .withMessage("Entry ID must be an integer")
    ]
  },
  contests: {
    add: [
      check("contest_name")
      .isLength(nameChars)
      .withMessage("Contest name cannot be empty or longer than 200 characters"),
      check("contest_author")
      .isLength(nameChars)
      .withMessage("Contest author cannot be empty or longer than 200 characters"),
      check("contest_current")
      .isBoolean()
      .withMessage("Current contest must be a boolean"),
      check("contest_url")
      .isURL()
      .withMessage("Must provide a valid contest URL"),
      check("contest_start_date")
      .matches(datePattern)
      .withMessage(`Must be a valid date ${dateFormat}`),
      check("contest_end_date")
      .matches(datePattern)
      .withMessage(`Must be a valid date ${dateFormat}`),
    ],
    edit: [
      check("edit_contest_id")
      .isInt()
      .withMessage("Contest ID must be an integer"),
      check("edit_contest_name")
      .isLength(nameChars)
      .withMessage("Contest name cannot be empty or longer than 200 characters"),
      check("edit_contest_author")
      .isLength(nameChars)
      .withMessage("Contest author cannot be empty or longer than 200 characters"),
      check("edit_contest_url")
      .isURL()
      .withMessage("Must provide a valid contest URL"),
      check("edit_contest_start_date")
      .matches(datePattern)
      .withMessage(`Start date must be a valid date ${dateFormat}`),
      check("edit_contest_end_date")
      .matches(datePattern)
      .withMessage(`End date must be a valid date ${dateFormat}`),
      check("edit_contest_current")
      .isBoolean()
      .withMessage("Current contest must be true or false")
    ],
    delete: [
      check("contest_id")
      .isInt()
      .withMessage("Contest ID must be an integer")
    ]
  },
  entries: {
    add: [
      check("contest_id")
      .isInt()
      .withMessage("Contest ID must be an integer"),
      check("entry_url")
      .isURL()
      .withMessage("Entry url must be a valid URL"),
      check("entry_kaid")
      .isInt()
      .withMessage("Entry KAID must be an integer"),
      check("entry_title")
      .isLength(nameChars)
      .withMessage("Entry title cannot be empty or longer than 200 characters"),
      check("entry_author")
      .isLength(nameChars)
      .withMessage("Entry author cannot be empty or longer than 200 characters"),
      check("entry_level")
      .isIn(skillLevels)
      .withMessage("Entry level must be 'Advanced', 'Intermediate', 'Beginner', or 'TBD'"),
      check("entry_votes")
      .isInt()
      .withMessage("Entry votes must be an integer"),
      check("entry_height")
      .isInt()
      .withMessage("Entry height must be an integer")
    ],
    edit: [
      check("edit_entry_id")
      .isInt()
      .withMessage("Entry ID must be an integer"),
      check("edit_entry_title")
      .isLength(nameChars)
      .withMessage("Entry title cannot be empty or longer than 200 characters"),
      check("edit_entry_author")
      .isLength(nameChars)
      .withMessage("Entry author cannot be empty or longer than 200 characters"),
      check("edit_entry_level")
      .isIn(skillLevels)
      .withMessage("Entry level must be 'Advanced', 'Intermediate', 'Beginner', or 'TBD'"),
      check("edit_flagged")
      .isBoolean()
      .withMessage("Flagged must be a boolean"),
      check("edit_disqualified")
      .isBoolean()
      .withMessage("Disqualified must be a boolean"),
    ],
    delete: [
      check("entry_id")
      .isInt()
      .withMessage("Entry ID must be an integer")
    ],
    import: [
      check("contest_id")
      .isInt()
      .withMessage("Contest ID must be an integer")
    ],
    flag: [
      check("entry_id")
      .isInt()
      .withMessage("Entry ID must be an integer")
    ],
    disqualify: [
      check("entry_id")
      .isInt()
      .withMessage("Entry ID must be an integer")
    ],
    approve: [
      check("entry_id")
      .isInt()
      .withMessage("Entry ID must be an integer")
    ],
    assignToGroups: [
      check("contest_id")
      .isInt()
      .withMessage("Contest ID must be an integer")
    ],
    transferEntryGroups: [
      check("contest_id")
      .isInt()
      .withMessage("Contest ID must be an integer"),
      check("current_entry_group")
      .isInt()
      .withMessage("Current group ID must be an integer"),
      check("new_entry_group")
      .isInt()
      .withMessage("New group ID must be an integer")
    ]
  },
  judging: {
    submit: [
      check("entry_id")
      .isInt()
      .withMessage("entry_id must be an integer"),
      check("creativity")
      .isIn(scores)
      .withMessage("creativity score must be >= 0 and <= 5"),
      check("complexity")
      .isIn(scores)
      .withMessage("complexity score must be >= 0 and <= 5"),
      check("quality_code")
      .isIn(scores)
      .withMessage("quality_code score must be >= 0 and <= 5"),
      check("interpretation")
      .isIn(scores)
      .withMessage("interpretation score must be >= 0 and <= 5"),
      check("skill_level")
      .isIn(skillLevels)
      .withMessage("skill_level must be 'Advanced', 'Intermediate', or 'Beginner'")
    ],
    addCriteria: [
      check("is_active")
      .isBoolean()
      .withMessage("is_active must be true or false")
    ],
    editCriteria: [
      check("criteria_id")
      .isInt()
      .withMessage("criteria_id must be an integer"),
      check("is_active")
      .isBoolean()
      .withMessage("is_active must be true or false")
    ],
    deleteCriteria: [
      check("criteria_id")
      .isInt()
      .withMessage("criteria_id must be an integer")
    ]
  },
  messages: {
    add: [
      check("message_title")
      .isLength(messageChars)
      .withMessage("Message title cannot be empty or longer than 100 characters"),
      check("message_content")
      .isLength(contentChars)
      .withMessage("Message content cannot be empty or longer than 5,000 characters"),
      check("public")
      .isBoolean()
      .withMessage("Public must be a boolean"),
    ],
    edit: [
      check("message_id")
      .isInt()
      .withMessage("Message ID must be an integer"),
      check("message_title")
      .isLength(messageChars)
      .withMessage("Message title cannot be empty or longer than 100 characters"),
      check("message_content")
      .isLength(contentChars)
      .withMessage("Message content cannot be empty or longer than 5,000 characters"),
      check("public")
      .isBoolean()
      .withMessage("Public must be a boolean"),
    ],
    delete: [
      check("message_id")
      .isInt()
      .withMessage("Message ID must be an integer")
    ]
  },
  users: {
    add: [
      check("evaluator_name")
      .isLength(nameChars)
      .withMessage("User's name cannot be empty or longer than 200 characters"),
      check("email")
      .isEmail()
      .withMessage("User's email must be a valid email"),
      check("evaluator_kaid")
      .matches(kaidPattern)
      .withMessage("User KAID must have correct format"),
      check("username")
      .isLength(nameChars)
      .withMessage("User's username cannot be empty or longer than 200 characters")
    ],
    edit: [
      oneOf([
        [
          check("edit_user_id")
          .isInt()
          .withMessage("User ID must be an integer"),
          check("edit_user_name")
          .isLength(nameChars)
          .withMessage("User name cannot be empty or longer than 200 characters"),
          check("edit_user_kaid")
          .matches(kaidPattern)
          .withMessage("User KAID must have correct format")
        ],
        [
          check("nickname")
          .not().isEmpty()
          .withMessage("Display name cannot be empty"),
          check("receive_emails")
          .isBoolean()
          .withMessage("receive_emails must be a boolean")
        ],
        [
          check("username")
          .isLength(nameChars)
          .withMessage("username is invalid")
        ]
      ])
    ],
    editPermissions: [
      check("evaluator_id")
      .isInt()
      .withMessage("evaluator_id must be an integer"),
      check("view_admin_stats")
      .isBoolean()
      .withMessage("view_admin_stats must be a boolean"),
      check("edit_contests")
      .isBoolean()
      .withMessage("edit_contests must be a boolean"),
      check("delete_contests")
      .isBoolean()
      .withMessage("delete_contests must be a boolean"),
      check("edit_entries")
      .isBoolean()
      .withMessage("edit_entries must be a boolean"),
      check("delete_entries")
      .isBoolean()
      .withMessage("delete_entries must be a boolean"),
      check("add_entries")
      .isBoolean()
      .withMessage("add_entries must be a boolean"),
      check("assign_entry_groups")
      .isBoolean()
      .withMessage("assign_entry_groups must be a boolean"),
      check("view_all_evaluations")
      .isBoolean()
      .withMessage("view_all_evaluations must be a boolean"),
      check("edit_all_evaluations")
      .isBoolean()
      .withMessage("edit_all_evaluations must be a boolean"),
      check("delete_all_evaluations")
      .isBoolean()
      .withMessage("delete_all_evaluations must be a boolean"),
      check("manage_winners")
      .isBoolean()
      .withMessage("manage_winners must be a boolean"),
      check("view_all_tasks")
      .isBoolean()
      .withMessage("view_all_tasks must be a boolean"),
      check("edit_all_tasks")
      .isBoolean()
      .withMessage("edit_all_tasks must be a boolean"),
      check("delete_all_tasks")
      .isBoolean()
      .withMessage("delete_all_tasks must be a boolean"),
      check("view_judging_settings")
      .isBoolean()
      .withMessage("view_judging_settings must be a boolean"),
      check("manage_judging_groups")
      .isBoolean()
      .withMessage("manage_judging_groups must be a boolean"),
      check("assign_evaluator_groups")
      .isBoolean()
      .withMessage("assign_evaluator_groups must be a boolean"),
      check("manage_judging_criteria")
      .isBoolean()
      .withMessage("manage_judging_criteria must be a boolean"),
      check("view_all_users")
      .isBoolean()
      .withMessage("view_all_users must be a boolean"),
      check("edit_user_profiles")
      .isBoolean()
      .withMessage("edit_user_profiles must be a boolean"),
      check("change_user_passwords")
      .isBoolean()
      .withMessage("change_user_passwords must be a boolean"),
      check("assume_user_identities")
      .isBoolean()
      .withMessage("assume_user_identities must be a boolean"),
      check("add_users")
      .isBoolean()
      .withMessage("add_users must be a boolean"),
      check("view_errors")
      .isBoolean()
      .withMessage("view_errors must be a boolean"),
      check("delete_errors")
      .isBoolean()
      .withMessage("delete_errors must be a boolean"),
      check("judge_entries")
      .isBoolean()
      .withMessage("judge_entries must be a boolean"),
      check("edit_kb_content")
      .isBoolean()
      .withMessage("edit_kb_content must be a boolean"),
      check("delete_kb_content")
      .isBoolean()
      .withMessage("delete_kb_content must be a boolean"),
      check("publish_kb_content")
      .isBoolean()
      .withMessage("publish_kb_content must be a boolean"),
      check("manage_announcements")
      .isBoolean()
      .withMessage("manage_announcements must be a boolean")
    ],
    assignToEvaluatorGroup: [
      oneOf([
        [
          check("evaluator_id")
          .isInt()
          .withMessage("User ID must be an integer or null"),
          check("group_id")
          .isInt()
          .withMessage("Group ID must be an integer")
        ],
        [
          check("evaluator_id")
          .isInt()
          .withMessage("User ID must be an integer or null"),
          check("group_id")
          .isIn([null])
          .withMessage("Group ID must be an integer")
        ]
      ])
    ]
  },
  winners: {
    add: [
      check("entry_id")
      .isInt()
      .withMessage("Entry ID must be an integer")
    ],
    delete: [
      check("entry_id")
      .isInt()
      .withMessage("Entry ID must be an integer")
    ],
    addVote: [
      check("entry_id")
      .isInt()
      .withMessage("Entry ID must be an integer"),
      check("feedback")
      .isLength(contentChars)
      .withMessage("Feedback must be between 1 and 5000 characters")
    ],
    deleteVote: oneOf([
      [
        check("entry_id")
        .isInt()
        .withMessage("Entry ID must be an integer")
      ],
      [
        check("vote_id")
        .isInt()
        .withMessage("Vote ID must be an integer")
      ]
    ])
  },
  tasks: {
    add: [
      check("task_title")
      .isLength(contentChars)
      .withMessage("Task title cannot be empty or longer than 200 characters"),
      check("due_date")
      .matches(datePattern)
      .withMessage(`Due date must be a valid date ${dateFormat}`),
      check("task_status")
      .isIn(taskStatuses)
      .withMessage("Task status must be 'Not Started', 'Started', 'Completed'"),
      check("assigned_member")
      .custom((assigned_member, { req }) => assigned_member === parseInt(assigned_member, 10) || assigned_member === null)
      .withMessage("Assigned member must be an integer")
    ],
    edit: oneOf([
      [
        check("edit_task_id")
        .isInt()
        .withMessage("Task id must be an integer")
      ],
      [
        check("edit_task_id")
        .isInt()
        .withMessage("Task id must be an integer"),
        check("edit_task_title")
        .isLength(contentChars)
        .withMessage("Task title cannot be empty or longer than 200 characters"),
        check("edit_due_date")
        .matches(datePattern)
        .withMessage(`Due date must be a valid date ${dateFormat}`),
        check("edit_task_status")
        .isIn(taskStatuses)
        .withMessage("Task status must be 'Not Started', 'Started', 'Completed'"),
        check("edit_assigned_member")
        .custom((assigned_member, { req }) => Number.isInteger(assigned_member) || assigned_member === null)
        .withMessage("Assigned member must be an integer")
      ]
    ]),
    delete: [
      check("task_id")
      .isInt()
      .withMessage("Task id must be an integer")
    ],
    signup: [
      check("task_id")
      .isInt()
      .withMessage("Task id must be an integer")
    ]
  },
  evaluations: {
    edit: [
      check("edit_evaluation_id")
      .isInt()
      .withMessage("Evaluation ID must be an integer"),
      check("edit_creativity")
      .isIn(scores)
      .withMessage("creativity score must be >= 0 and <= 5"),
      check("edit_complexity")
      .isIn(scores)
      .withMessage("complexity score must be >= 0 and <= 5"),
      check("edit_execution")
      .isIn(scores)
      .withMessage("execution score must be >= 0 and <= 5"),
      check("edit_interpretation")
      .isIn(scores)
      .withMessage("interpretation score must be >= 0 and <= 5"),
      check("edit_evaluation_level")
      .isIn(skillLevels)
      .withMessage("skill_level must be 'Advanced', 'Intermediate', or 'Beginner'")
    ],
    delete: [
      check("evaluation_id")
      .isInt()
      .withMessage("Evaluation ID must be an integer")
    ]
  },
  kb: {
    addSection: [
      check("section_name")
      .isLength(contentChars)
      .withMessage("section_name must be between 0 and 5000 characters"),
      check("section_description")
      .isLength(contentChars)
      .withMessage("section_description must be between 0 and 5000 characters"),
      check("section_visibility")
      .isIn(visibilities)
      .withMessage("Incorrect visibility")
    ],
    editSection: [
      check("section_id")
      .isInt(),
      check("section_name")
      .isLength(contentChars)
      .withMessage("section_name must be between 0 and 5000 characters"),
      check("section_description")
      .isLength(contentChars)
      .withMessage("section_description must be between 0 and 5000 characters"),
      check("section_visibility")
      .isIn(visibilities)
      .withMessage("Incorrect visibility")
    ],
    deleteSection: [
      check("section_id")
      .isInt()
      .withMessage("section_id must be an integer")
    ],
    addArticle: [
      check("article_name")
      .isLength(contentChars)
      .withMessage("article_name must be between 0 and 5000 characters"),
      check("article_visibility")
      .isIn(visibilities)
      .withMessage("Incorrect visibility"),
      check("article_section")
      .isInt()
      .withMessage("article_section must be an integer")
    ],
    editArticle: [
      check("article_id")
      .isInt()
      .withMessage("article_id must be an integer"),
      check("article_name")
      .isLength(contentChars)
      .withMessage("article_name must be between 0 and 5000 characters"),
      check("article_content")
      .isLength(contentChars)
      .withMessage("Article content must be between 0 and 5000 characters")
    ],
    editArticleProperties: [
      check("article_id")
      .isInt()
      .withMessage("article_id must be an integer"),
      check("article_section")
      .isInt()
      .withMessage("section_id must be an integer"),
      check("article_visibility")
      .isIn(visibilities)
      .withMessage("Incorrect visibility"),
      check("is_published")
      .isBoolean()
      .withMessage("is_published must be a boolean")
    ],
    deleteArticle: [
      check("article_id")
      .isInt()
      .withMessage("article_id must be an integer")
    ],
    addArticleDraft: [
      check("article_id")
      .isInt()
      .withMessage("article_id must be an integer"),
      check("article_name")
      .isLength(contentChars)
      .withMessage("article_name must be between 0 and 5000 characters"),
      check("article_content")
      .isLength(contentChars)
      .withMessage("Article content must be between 0 and 5000 characters")
    ],
    editArticleDraft: [
      check("draft_id")
      .isInt()
      .withMessage("draft_id must be an integer"),
      check("article_name")
      .isLength(contentChars)
      .withMessage("article_name must be between 0 and 5000 characters"),
      check("article_content")
      .isLength(contentChars)
      .withMessage("Article content must be between 0 and 5000 characters")
    ]
  },
  errors: {
    delete: [
      check("error_id")
      .isInt()
      .withMessage("error_id must be an integer")
    ]
  }
};

router.use(hasBody);

// Docs for validation:
// https://github.com/chriso/validator.js#validators
router.get("/ping", admin.ping);

// Winners
router.post("/internal/winners", routeChecks.winners.add, wasValidated, winners.add);
router.delete("/internal/winners", routeChecks.winners.delete, wasValidated, winners.delete);
router.get("/internal/winners/votes", winners.getVotes);
router.post("/internal/winners/votes", routeChecks.winners.addVote, wasValidated, winners.addVote);
router.delete("/internal/winners/votes", routeChecks.winners.deleteVote, wasValidated, winners.deleteVote);

// Users
router.get("/internal/users/stats", users.stats);
router.put("/internal/users/permissions", routeChecks.users.editPermissions, wasValidated, users.editPermissions);
router.put("/internal/users", routeChecks.users.edit, wasValidated, users.edit);
router.put("/internal/users/assignToEvaluatorGroup", routeChecks.users.assignToEvaluatorGroup, wasValidated, users.assignToEvaluatorGroup);
router.post("/internal/users", routeChecks.users.add, wasValidated, users.add);

// Contestants
router.get("/internal/contestants/search", contestants.search);
router.get("/internal/contestants/entries", contestants.getEntries);
router.get("/internal/contestants/stats", contestants.stats);

// Messages
router.post("/internal/messages", routeChecks.messages.add, wasValidated, messages.add);
router.put("/internal/messages", routeChecks.messages.edit, wasValidated, messages.edit);
router.delete("/internal/messages", routeChecks.messages.delete, wasValidated, messages.delete);

// Judging
router.get("/internal/judging/getNextEntry", judging.getNextEntry);
router.post("/internal/judging/criteria", routeChecks.judging.addCriteria, wasValidated, judging.addJudgingCriteria);
router.put("/internal/judging/criteria", routeChecks.judging.editCriteria, wasValidated, judging.editJudgingCriteria);
router.delete("/internal/judging/criteria", routeChecks.judging.deleteCriteria, wasValidated, judging.deleteJudgingCriteria);
router.post("/internal/judging/submit", routeChecks.judging.submit, wasValidated, judging.submit);

// Entries
router.get("/internal/entries", entries.get);
router.post("/internal/entries", routeChecks.entries.add, wasValidated, entries.add);
router.put("/internal/entries", routeChecks.entries.edit, wasValidated, entries.edit);
router.delete("/internal/entries", routeChecks.entries.delete, wasValidated, entries.delete);
router.post("/internal/entries/import", routeChecks.entries.import, wasValidated, entries.import);
router.put("/internal/entries/flag", routeChecks.entries.flag, wasValidated, entries.flag);
router.put("/internal/entries/disqualify", routeChecks.entries.disqualify, wasValidated, entries.disqualify);
router.put("/internal/entries/approve", routeChecks.entries.approve, wasValidated, entries.approve);
router.get("/internal/entries/flagged", entries.getFlagged);
router.put("/internal/entries/assignToGroups", routeChecks.entries.assignToGroups, wasValidated, entries.assignToGroups);
router.put("/internal/entries/transferEntryGroups", routeChecks.entries.transferEntryGroups, wasValidated, entries.transferEntryGroups);

// Results
router.get("/internal/results", results.get);

// Contests
router.get("/internal/contests/getContestsEvaluatedByUser", contests.getContestsEvaluatedByUser);
router.post("/internal/contests", routeChecks.contests.add, wasValidated, contests.add);
router.put("/internal/contests", routeChecks.contests.edit, wasValidated, contests.edit);
router.delete("/internal/contests", routeChecks.contests.delete, wasValidated, contests.delete);

// Admin
router.get("/internal/admin/stats", admin.stats);
router.post("/internal/admin/addEvaluatorGroup", routeChecks.admin.addEvaluatorGroup, wasValidated, admin.addEvaluatorGroup);
router.put("/internal/admin/editEvaluatorGroup", routeChecks.admin.editEvaluatorGroup, wasValidated, admin.editEvaluatorGroup);
router.delete("/internal/admin/deleteEvaluatorGroup", routeChecks.admin.deleteEvaluatorGroup, wasValidated, admin.deleteEvaluatorGroup);

// Entry Skill Levels
router.get("/internal/admin/skillLevels/getNextEntryToReview", admin.getNextEntryToReview);
router.put("/internal/admin/skillLevels/setEntrySkillLevel", routeChecks.admin.setEntrySkillLevel, wasValidated, admin.setEntrySkillLevel);

// Tasks
router.get("/internal/tasks/incomplete", tasks.getIncomplete);
router.get("/internal/tasks/complete", tasks.getComplete);
router.get("/internal/tasks/user", tasks.getForUser);
router.get("/internal/tasks/available", tasks.getAvailable);
router.post("/internal/tasks", routeChecks.tasks.add, wasValidated, tasks.add);
router.put("/internal/tasks", routeChecks.tasks.edit, wasValidated, tasks.edit);
router.put("/internal/tasks/signup", routeChecks.tasks.signup, wasValidated, tasks.signUpForTask);
router.delete("/internal/tasks", routeChecks.tasks.delete, wasValidated, tasks.delete);

// Evaluations
router.get("/internal/evaluations", evaluations.get);
router.put("/internal/evaluations", routeChecks.evaluations.edit, wasValidated, evaluations.put);
router.delete("/internal/evaluations", routeChecks.evaluations.delete, wasValidated, evaluations.delete);

// Knowledge Base
router.get("/internal/kb/getSection", kb.getSection);
router.get("/internal/kb/sections", kb.getAllSections);
router.put("/internal/kb/sections", routeChecks.kb.editSection, wasValidated, kb.editSection);
router.post("/internal/kb/sections", routeChecks.kb.addSection, wasValidated, kb.addSection);
router.delete("/internal/kb/sections", routeChecks.kb.deleteSection, wasValidated, kb.deleteSection);
router.get("/internal/kb/articles", kb.getArticles);
router.post("/internal/kb/articles", routeChecks.kb.addArticle, wasValidated, kb.addArticle);
router.put("/internal/kb/articles", routeChecks.kb.editArticle, wasValidated, kb.editArticle);
router.put("/internal/kb/articles/properties", routeChecks.kb.editArticleProperties, wasValidated, kb.editArticleProperties);
router.delete("/internal/kb/articles", routeChecks.kb.deleteArticle, wasValidated, kb.deleteArticle);
router.get("/internal/kb/articles/drafts", kb.getArticleDraft);
router.post("/internal/kb/articles/drafts", routeChecks.kb.addArticleDraft, wasValidated, kb.addArticleDraft);
router.put("/internal/kb/articles/drafts", routeChecks.kb.editArticleDraft, wasValidated, kb.editArticleDraft);

// Errors
router.delete("/internal/errors", routeChecks.errors.delete, wasValidated, errors.delete);

module.exports = router;