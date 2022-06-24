const express = require("express");
const router = express.Router();
const handlers = require(process.cwd() + "/handlers/auth");

router.post("/logout", handlers.logout);
router.put("/changePassword", handlers.changePassword);
router.post("/assumeUserIdentity", handlers.assumeUserIdentity);

module.exports = router;