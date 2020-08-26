const express = require("express");
const router = express.Router();
const handlers = require(process.cwd() + "/handlers/auth");

router.get("/ping", (req, res) => {
    res.send("Pong!");
});

router.post("/login", handlers.login);
router.post("/logout", handlers.logout);
router.put("/changePassword", handlers.changePassword)

module.exports = router;
