const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.get = (request, response, next) => {
    try {
        if (request.decodedToken && request.decodedToken.is_admin) {
            return db.query("SELECT * FROM error ORDER BY error_id DESC", [], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting all the logged errors.", res.error);
                }
                return response.json({
                    logged_in: true,
                    is_admin: request.decodedToken.is_admin,
                    errors: res.rows
                });
            });
        } else {
            handleNext(next, 403, "You're not authorized to access this information.")
        }
    } catch (error) {
        return handleNext(next, 400, "Unexpected error while retrieving logged errors.", error);
    }
}

exports.delete = (request, response, next) => {
    try {
        let error_id = request.body;
        if (request.decodedToken && request.decodedToken.is_admin) {
            return db.query("DELETE FROM error WHERE error_id = $1", [error_id], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem deleting this logged error.", res.error);
                }
                successMsg(response);
            });
        } else {
            handleNext(next, 403, "You're not authorized to delete logged errors.")
        }
    } catch (error) {
        return handleNext(next, 400, "Unexpected error while deleting a logged error.", error);
    }
}

module.exports = exports;
