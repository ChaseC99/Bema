const {
    handleNext,
    jsonMessage
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const { displayDateFormat, displayFancyDateFormat, publicPermissions } = require(process.cwd() + "/util/variables");

exports.home = (request, response, next) => {
    if (request.decodedToken) {
        return response.render("pages/home", {
            logged_in: true,
            is_admin: request.decodedToken.is_admin,
            permissions: request.decodedToken.permissions,
            is_impersonated: request.decodedToken.is_impersonated,
            evaluator_id: request.decodedToken.evaluator_id
        });
    }
    response.render("pages/home", {
        logged_in: false,
        is_admin: false,
        permissions: publicPermissions,
        is_impersonated: false
    });
}

exports.login = (request, response) => {
    if (request.decodedToken) {
        return response.redirect("/");
    }
    response.render("pages/login", {
        logged_in: false,
        permissions: publicPermissions,
        is_impersonated: false
    });
}

exports.judging = (request, response, next) => {
    if (request.decodedToken && (request.decodedToken.permissions.judge_entries || request.decodedToken.is_admin)) {
        return db.query("SELECT * FROM get_entry_and_create_placeholder($1)", [request.decodedToken.evaluator_id], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting an entry");
            }
            return response.render("pages/judging", {
                entry: res.rows[0],
                logged_in: true,
                permissions: request.decodedToken.permissions,
                is_impersonated: request.decodedToken.is_impersonated,
                evaluator_id: request.decodedToken.evaluator_id
            });
        });
    }
    // Instead, show the public version with dumby data.
    response.render("pages/judging", {
        logged_in: false,
        entry: {
            o_entry_id: 1316,
            o_entry_url: 'https://www.khanacademy.org/computer-programming/example-entry/6586620957786112',
            o_entry_title: 'Example entry',
            o_entry_height: 400
        },
        permissions: publicPermissions,
        is_impersonated: false
    });
}

exports.adminDashboard = (request, response, next) => {
    if (request.decodedToken) {
        return response.render("pages/admin/dashboard", {
            logged_in: true,
            is_admin: request.decodedToken.is_admin,
            evaluator_id: request.decodedToken.evaluator_id,
            permissions: request.decodedToken.permissions,
            is_impersonated: request.decodedToken.is_impersonated
        });
    } else {
        return response.render("pages/admin/dashboard", {
            logged_in: false,
            is_admin: false,
            permissions: publicPermissions,
            is_impersonated: false
        });
    }
}

exports.adminContests = (request, response, next) => {
    if (request.decodedToken) {
        return response.render("pages/admin/contests", {
            logged_in: true,
            is_admin: request.decodedToken.is_admin,
            evaluator_id: request.decodedToken.evaluator_id,
            permissions: request.decodedToken.permissions,
            is_impersonated: request.decodedToken.is_impersonated
        });
    } else {
        return response.render("pages/admin/contests", {
            logged_in: false,
            is_admin: false,
            permissions: publicPermissions,
            is_impersonated: false
        });
    }
}

exports.adminTasks = (request, response, next) => {
    if (request.decodedToken && (request.decodedToken.permissions.view_all_tasks || request.decodedToken.is_admin)) {
        return response.render("pages/admin/tasks", {
            logged_in: true,
            is_admin: request.decodedToken.is_admin,
            evaluator_id: request.decodedToken.evaluator_id,
            permissions: request.decodedToken.permissions,
            is_impersonated: request.decodedToken.is_impersonated
        });
    } else {
        response.redirect("/admin/dashboard");
    }
}

exports.adminUsers = (request, response, next) => {
    if (request.decodedToken && (request.decodedToken.permissions.view_all_users || request.decodedToken.is_admin)) {
        return response.render("pages/admin/users", {
            logged_in: true,
            is_admin: request.decodedToken.is_admin,
            evaluator_id: request.decodedToken.evaluator_id,
            permissions: request.decodedToken.permissions,
            is_impersonated: request.decodedToken.is_impersonated
        });
    } else {
        response.redirect("/admin/dashboard");
    }
}

exports.adminJudging = (request, response, next) => {
    if (request.decodedToken && (request.decodedToken.permissions.view_judging_settings || request.decodedToken.is_admin)) {
        return response.render("pages/admin/judging", {
            logged_in: true,
            is_admin: request.decodedToken.is_admin,
            evaluator_id: request.decodedToken.evaluator_id,
            permissions: request.decodedToken.permissions,
            is_impersonated: request.decodedToken.is_impersonated
        });
    } else {
        response.redirect("/admin/dashboard");
    }
}

exports.adminEvaluations = (request, response, next) => {
    if (request.decodedToken) {
        let userId = parseInt(request.params.userId);
        if (request.decodedToken.evaluator_id === userId || request.decodedToken.permissions.view_all_evaluations || request.decodedToken.is_admin) {
            return response.render("pages/admin/evaluations", {
                logged_in: true,
                is_admin: request.decodedToken.is_admin,
                evaluator_id: request.decodedToken.evaluator_id,
                current_contest_id: parseInt(request.params.contestId),
                current_evaluator_id: userId,
                permissions: request.decodedToken.permissions,
                is_impersonated: request.decodedToken.is_impersonated
            });
        } else {
            response.redirect("/admin/dashboard");
        }
    }
    else {
        response.redirect("/admin/dashboard");
    }
}

exports.adminErrors = (request, response, next) => {
    if (request.decodedToken && (request.decodedToken.permissions.view_errors || request.decodedToken.is_admin)) {
        return response.render("pages/admin/errors", {
            logged_in: true,
            is_admin: true,
            evaluator_id: request.decodedToken.evaluator_id,
            permissions: request.decodedToken.permissions,
            is_impersonated: request.decodedToken.is_impersonated
        });
    } else {
        response.redirect("/admin/dashboard");
    }
}

exports.results = (request, response, next) => {
    if (request.decodedToken) {
        return response.render("pages/results", {
            logged_in: true,
            is_admin: request.decodedToken.is_admin,
            evaluator_id: request.decodedToken.evaluator_id,
            permissions: request.decodedToken.permissions,
            is_impersonated: request.decodedToken.is_impersonated
        });
    }
    response.render("pages/results", {
        is_admin: false,
        logged_in: false,
        permissions: publicPermissions,
        is_impersonated: false
    });
}

exports.entries = (request, response, next) => {
    if (request.decodedToken) {
        return response.render("pages/entries", {
            logged_in: true,
            contest_id: request.params.contestId,
            is_admin: request.decodedToken.is_admin,
            evaluator_id: request.decodedToken.evaluator_id,
            permissions: request.decodedToken.permissions,
            is_impersonated: request.decodedToken.is_impersonated
        });
    }
    response.render("pages/entries", {
        is_admin: false,
        logged_in: false,
        permissions: publicPermissions,
        is_impersonated: false
    });
}

exports.kbHome = (request, response, next) => {
    if (request.decodedToken) {
        return response.render("pages/knowledge-base/home", {
            logged_in: true,
            is_admin: request.decodedToken.is_admin,
            evaluator_id: request.decodedToken.evaluator_id,
            permissions: request.decodedToken.permissions,
            is_impersonated: request.decodedToken.is_impersonated
        });
    }
    response.render("pages/knowledge-base/home", {
        is_admin: false,
        logged_in: false,
        permissions: publicPermissions,
        is_impersonated: false
    });
}

exports.kbArticle = (request, response, next) => {
    let articleId = parseInt(request.params.articleId);
    let is_admin = request.decodedToken ? request.decodedToken.is_admin : false;

    // Check that the article exists and the user can view it
    return db.query("SELECT COUNT(*) FROM kb_article WHERE article_id = $1", [articleId], res => {
        if (res.error) {
            return handleNext(next, 400, "There was a problem getting the article");
        }

        if (res.rows[0].count === "0") {
            response.redirect("/kb");
        }

        return db.query("SELECT article_visibility, is_published FROM kb_article WHERE article_id = $1", [articleId], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the article");
            }

            if (res.rows[0].article_visibility === "Public" && res.rows[0].is_published) {
                // Do nothing, this article is public
            }
            else if ((!request.decodedToken && res.rows[0].article_visibility !== "Public") ||
                (!is_admin && res.rows[0].article_visibility === "Admins Only") ||
                (!is_admin && !request.decodedToken.permissions.edit_kb_content && !res.rows[0].is_published)) {
                response.redirect("/kb");
            }

            if (request.decodedToken) {
                return response.render("pages/knowledge-base/article", {
                    article_id: articleId,
                    logged_in: true,
                    is_admin: request.decodedToken.is_admin,
                    evaluator_id: request.decodedToken.evaluator_id,
                    permissions: request.decodedToken.permissions,
                    is_impersonated: request.decodedToken.is_impersonated
                });
            }
            response.render("pages/knowledge-base/article", {
                article_id: articleId,
                logged_in: false,
                is_admin: false,
                permissions: publicPermissions,
                is_impersonated: false
            });
        });
    });
}

exports.evaluatorProfile = (request, response, next) => {
    let userId = parseInt(request.params.userId);

    if (request.decodedToken) {
        response.render("pages/evaluatorProfile", {
            is_self: userId === request.decodedToken.evaluator_id ? true : false,
            evaluator_id: userId,
            logged_in: true,
            is_admin: request.decodedToken.is_admin,
            evaluator_id: request.decodedToken.evaluator_id,
            permissions: request.decodedToken.permissions,
            is_impersonated: request.decodedToken.is_impersonated
        });
    }
    response.render("pages/home", {
        logged_in: false,
        is_admin: false,
        permissions: publicPermissions,
        is_impersonated: false
    });
}

module.exports = exports;
