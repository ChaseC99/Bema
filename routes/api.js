const express = require("express");
const router = express.Router();
const hasBody = require(process.cwd() + "/middleware/hasBody");
const { check } = require('express-validator/check');
const wasValidated = require(process.cwd() + "/middleware/wasValidated");
const { contentChars, visibilities } = require(process.cwd() + "/util/variables");

const kb = require(process.cwd() + "/handlers/api/knowledge-base");

const routeChecks = {
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
  }
};

router.use(hasBody);

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

module.exports = router;