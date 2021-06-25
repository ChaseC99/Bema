const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.search = (request, response, next) => {
    try {
        if (request.decodedToken) {
            let searchQuery = request.query.searchQuery || "";

            if (searchQuery.includes("kaid_")) {
                return db.query("SELECT STRING_AGG(entry_author, ', ') as contestant_names, entry_author_kaid as contestant_kaid FROM entry WHERE entry_author_kaid LIKE $1 GROUP BY entry_author_kaid", ["%"+searchQuery+"%"], res => {
                    if (res.error) {
                        return handleNext(next, 500, "There was a problem searching for this contestant.", res.error);
                    }
                    response.json({
                        is_admin: request.decodedToken ? request.decodedToken.is_admin : false,
                        logged_in: true,
                        contestants: res.rows
                    });
                });
            } else {
                return db.query("SELECT STRING_AGG(entry_author, ', ') as contestant_names, entry_author_kaid as contestant_kaid FROM entry WHERE entry_author LIKE $1 GROUP BY entry_author_kaid", ["%"+searchQuery+"%"], res => {
                    if (res.error) {
                        return handleNext(next, 500, "There was a problem searching for this contestant.", res.error);
                    }
                    response.json({
                        is_admin: request.decodedToken ? request.decodedToken.is_admin : false,
                        logged_in: true,
                        contestants: res.rows
                    });
                });
            }
        }
        return handleNext(next, 401, "You must log in to search for contestants.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while searching for a contestant.", error);
    }
};

module.exports = exports;
