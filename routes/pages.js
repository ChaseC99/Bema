const express = require("express");
const router = express.Router();
const handlers = require(process.cwd() + "/handlers/pages");

router.get("/login", handlers.login);
router.get("/judging", handlers.judging);
router.get("/entries/:contestId", handlers.entries)
router.get("/admin/contests", handlers.adminContests);
router.get("/admin/skill-levels", handlers.adminSkillLevels);
router.get("/admin/users", handlers.adminUsers);
router.get("/admin/judging", handlers.adminJudging);
router.get("/admin/evaluations/:userId/:contestId", handlers.adminEvaluations);
router.get("/admin/errors", handlers.adminErrors);
router.get("/kb", handlers.kbHome);
router.get("/kb/article/:articleId", handlers.kbArticle);
router.get("/evaluator/:userId", handlers.evaluatorProfile);
router.get("/contestants", handlers.contestants);
router.get("/contestants/:contestantId", handlers.contestantProfile);
module.exports = router;