const express = require("express");
const router = express.Router();
const handlers = require(process.cwd() + "/handlers/pages");

router.get("/login", handlers.login);
router.get("/judging", handlers.judging);
router.get("/admin/skill-levels", handlers.adminSkillLevels);
router.get("/admin/users", handlers.adminUsers);
router.get("/admin/judging", handlers.adminJudging);
router.get("/admin/errors", handlers.adminErrors);
router.get("/admin/kb", handlers.kbHome);
router.get("/admin/kb/article/:articleId", handlers.kbArticle);
router.get("/evaluator/:userId", handlers.evaluatorProfile);
module.exports = router;