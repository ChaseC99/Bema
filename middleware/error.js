const db = require("../util/db");

const errorHandler = (data, request, response, next) => {
	if (data.status !== 401 && data.status !== 403) {
		return db.query("SELECT log_error($1, $2);", [data.message, data.error.stack], res => {
			return response.status(data.status || 500).json({
				error: {
					status: data.status,
					message: data.message || "Unknown error",
					id: res.rows[0].log_error
				},
			});
		});
	} else {
		return response.status(data.status || 500).json({
			error: {
				status: data.status,
				message: data.message || "Unknown error",
				id: null
			},
		});
	}
}

module.exports = errorHandler;
