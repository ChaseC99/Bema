const express = require("express");
const router = express.Router();
const hasBody = require(process.cwd() + "/middleware/hasBody");
const { check, oneOf } = require('express-validator/check');
const wasValidated = require(process.cwd() + "/middleware/wasValidated");
const { nameChars, kaidPattern, contentChars, skillLevels, visibilities } = require(process.cwd() + "/util/variables");

const entries = require(process.cwd() + "/handlers/api/entries");
const users = require(process.cwd() + "/handlers/api/users");
const kb = require(process.cwd() + "/handlers/api/knowledge-base");
const errors = require(process.cwd() + "/handlers/api/errors");

const routeChecks = {
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
    ]
  },
  users: {
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

// Users
router.put("/internal/users/permissions", routeChecks.users.editPermissions, wasValidated, users.editPermissions);
router.put("/internal/users/assignToEvaluatorGroup", routeChecks.users.assignToEvaluatorGroup, wasValidated, users.assignToEvaluatorGroup);

// Entries
router.post("/internal/entries", routeChecks.entries.add, wasValidated, entries.add);

// Knowledge Base
router.put("/internal/kb/sections", routeChecks.kb.editSection, wasValidated, kb.editSection);
router.post("/internal/kb/sections", routeChecks.kb.addSection, wasValidated, kb.addSection);
router.delete("/internal/kb/sections", routeChecks.kb.deleteSection, wasValidated, kb.deleteSection);
router.post("/internal/kb/articles", routeChecks.kb.addArticle, wasValidated, kb.addArticle);
router.put("/internal/kb/articles", routeChecks.kb.editArticle, wasValidated, kb.editArticle);
router.put("/internal/kb/articles/properties", routeChecks.kb.editArticleProperties, wasValidated, kb.editArticleProperties);
router.delete("/internal/kb/articles", routeChecks.kb.deleteArticle, wasValidated, kb.deleteArticle);
router.post("/internal/kb/articles/drafts", routeChecks.kb.addArticleDraft, wasValidated, kb.addArticleDraft);
router.put("/internal/kb/articles/drafts", routeChecks.kb.editArticleDraft, wasValidated, kb.editArticleDraft);

// Errors
router.delete("/internal/errors", routeChecks.errors.delete, wasValidated, errors.delete);

module.exports = router;