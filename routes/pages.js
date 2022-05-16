const express = require("express");
const router = express.Router();
const handlers = require(process.cwd() + "/handlers/pages");

router.get("/admin/kb", handlers.kbHome);
router.get("/admin/kb/article/:articleId", handlers.kbArticle);
router.get("/evaluator/:userId", handlers.evaluatorProfile);
module.exports = router;