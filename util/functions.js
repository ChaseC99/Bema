const jwt = require("jsonwebtoken");
const db = require("./db");

exports.createJWTToken = (kaid) => {
    return new Promise((resolve, reject) => {
        db.query("SELECT evaluator_id, evaluator_name, evaluator_kaid, is_admin, account_locked, email, username, nickname, avatar_url FROM evaluator WHERE evaluator_kaid = $1", [kaid], result => {
            if (result.error) {
                throw new Error("There was a problem while searching for this evaluator_kaid, please try again");
            }
            let {
                evaluator_id,
                evaluator_name,
                evaluator_kaid,
                is_admin,
                account_locked,
                email,
                username,
                nickname,
                avatarUrl
            } = result.rows[0];
            let jwtToken = jwt.sign({
                evaluator_id,
                evaluator_name,
                evaluator_kaid,
                is_admin,
                account_locked,
                email,
                username,
                nickname,
                avatarUrl
            }, process.env.SECRET_KEY);
            resolve(jwtToken);
        });
    });
}

exports.getJWTToken = req => {
    return new Promise((resolve, reject) => {
        const jwtToken = req.cookies.jwtToken;
        if (jwtToken) {
            jwt.verify(jwtToken, process.env.SECRET_KEY, (err, decoded) => {
                if (err) {
                    throw new Error(err.message);
                } else if (decoded) {
                    resolve(decoded);
                } else {
                    throw new Error("Corrupted decoded JWT token");
                }
            });
        } else {
            throw new Error("Token not found");
        }
    });
}

// Reduce repeated next() code.
exports.handleNext = (next, status, message) => {
    return next({
        status,
        message
    });
}

exports.successMsg = (res, message = 'Success! Refreshing now...') => {
    return res.json({
        message: message
    });
}

// Respond with JSON message.
exports.jsonMessage = (res, code, msg) => {
    return res.json({
        code: code,
        message: msg
    });
}

module.exports = exports;
