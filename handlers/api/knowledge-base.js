/** Handlers for the knowledge base sections and articles **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const { displayDateFormat } = require(process.cwd() + "/util/variables");

exports.getAllSections = (request, response, next) => {
    try {
        if (request.decodedToken) {
            let {
                is_admin
            } = request.decodedToken;

            if (is_admin) {
                // User is an admin, so return all sections
                return db.query("SELECT * FROM kb_section ORDER BY section_visibility, section_name", [], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem retrieving the knowledge base sections.", res.error);
                    }
                    response.json({
                        is_admin: true,
                        logged_in: true,
                        sections: res.rows
                    });
                });
            } else {
                // User is a standard user, so only return sections with "Evaluators Only" visibility
                return db.query("SELECT * FROM kb_section WHERE section_visibility = 'Evaluators Only' OR section_visibility = 'Public' ORDER BY section_visibility, section_name", [], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem retrieving the knowledge base sections.", res.error);
                    }
                    response.json({
                        is_admin: false,
                        logged_in: true,
                        sections: res.rows
                    });
                });
            }
        } else {
            // User is not logged in, so only return public sections
            return db.query("SELECT * FROM kb_section WHERE section_visibility = 'Public' ORDER BY section_id", [], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem retrieving the knowledge base sections.", res.error);
                }
                response.json({
                    is_admin: false,
                    logged_in: false,
                    sections: res.rows
                });
            });
        }
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while retrieving the knowledge base sections.", error);
    }
};

exports.getSection = (request, response, next) => {
    try {
        let section_id = parseInt(request.query.sectionId);
        let is_admin = request.decodedToken ? request.decodedToken.is_admin : false;

        if (section_id > 0) {
            return db.query("SELECT * FROM kb_section WHERE section_id = $1", [section_id], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting the requested section.", res.error);
                }

                if ((res.rows[0].section_visibility === "Admin Only" && !is_admin) ||
                    (res.rows[0].section_visibility === "Evaluators Only") && !request.decodedToken) {
                    return handleNext(next, 403, "You're not authorized to access this section.");
                }
                response.json({
                    is_admin: is_admin,
                    logged_in: request.decodedToken ? true : false,
                    section: res.rows[0]
                });
            });
        } else {
            return handleNext(next, 400, "section_id must be specified.", new Error("section_id is invalid."));
        }
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while retrieving this knowledge base section.", error);
    }
};

exports.addSection = (request, response, next) => {
    try {
        let {
            section_name,
            section_description,
            section_visibility
        } = request.body;

        if (request.decodedToken) {
            if (request.decodedToken.permissions.edit_kb_content || request.decodedToken.is_admin) {
                return db.query("INSERT INTO kb_section (section_name, section_description, section_visibility) VALUES ($1, $2, $3)", [section_name, section_description, section_visibility], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem creating this section.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to create knowledge base sections.");
            }
        }
        return handleNext(next, 401, "You must log in to create knowledge base sections.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while creating a knowledge base section.", error);
    }
};

exports.editSection = (request, response, next) => {
    try {
        let {
            section_id,
            section_name,
            section_description,
            section_visibility
        } = request.body;

        if (request.decodedToken) {
            if (request.decodedToken.permissions.edit_kb_content || request.decodedToken.is_admin) {
                return db.query("UPDATE kb_section SET section_name = $1, section_description = $2, section_visibility = $3 WHERE section_id = $4", [section_name, section_description, section_visibility, section_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem editing this section.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to edit knowledge base sections.");
            }
        }
        return handleNext(next, 401, "You must log in to edit knowledge base sections.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while editing a knowledge base section.", error);
    }
};


exports.deleteSection = (request, response, next) => {
    try {
        let {
            section_id
        } = request.body;

        if (request.decodedToken) {
            if (request.decodedToken.permissions.delete_kb_content || request.decodedToken.is_admin) {
                return db.query("DELETE FROM kb_section WHERE section_id = $1", [section_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting this section.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to delete knowledge base sections.");
            }
        }
        return handleNext(next, 401, "You must log in to delete knowledge base sections.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while deleting a knowledge base section.", error);
    }
};

exports.getArticles = (request, response, next) => {
    try {
        let article_id = parseInt(request.query.articleId);
        let section_id = parseInt(request.query.sectionId);
        let is_admin = request.decodedToken ? request.decodedToken.is_admin : false;

        // Get all articles within a section
        if (section_id > 0) {
            let query = "SELECT * FROM kb_article WHERE section_id = $1 AND article_visibility = 'Public' AND is_published = true ORDER BY article_name";
            if (is_admin) {
                // If user is admin, return all articles in the section_name
                query = "SELECT * FROM kb_article WHERE section_id = $1 ORDER BY article_name";
            }
            else if (request.decodedToken && !is_admin && request.decodedToken.permissions.edit_kb_content) {
                // If user is evaluator, but not an admin, return all articles that are public or restricted to evaluators
                query = "SELECT * FROM kb_article WHERE (article_visibility = 'Public' OR article_visibility = 'Evaluators Only') AND section_id = $1 ORDER BY article_name";
            }
            else if (request.decodedToken && !is_admin) {
                // If user is evaluator, but not an admin, return all articles that are public or restricted to evaluators
                query = "SELECT * FROM kb_article WHERE (article_visibility = 'Public' OR article_visibility = 'Evaluators Only') AND section_id = $1 AND is_published = true ORDER BY article_name";
            }

            return db.query(query, [section_id], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting the requested articles.", res.error);
                }

                response.json({
                    is_admin: is_admin,
                    logged_in: request.decodedToken ? true : false,
                    articles: res.rows
                });
            });
        // Get a single article
        } else if (article_id > 0) {
            return db.query("SELECT *, to_char(a.article_last_updated, $1) as last_updated FROM kb_article a WHERE a.article_id = $2", [displayDateFormat, article_id], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting the requested article.", res.error);
                }

                // Check visibility permissions
                if ((res.rows[0].article_visibility === "Admin Only" && !is_admin) ||
                    (res.rows[0].article_visibility === "Evaluators Only") && !request.decodedToken) {
                    return handleNext(next, 403, "You're not authorized to access that article.");
                }

                response.json({
                    is_admin: is_admin,
                    logged_in: request.decodedToken ? true : false,
                    article: res.rows[0]
                });
            });
        } else {
            return handleNext(next, 400, "You must specify an article or section to retrieve.", new Error("article_id and section_id are invalid."));
        }
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while retrieving a knowledge base article.", error);
    }
};

exports.addArticle = (request, response, next) => {
    try {
        let {
            article_name,
            article_content,
            article_visibility,
            article_section
        } = request.body;

        if (request.decodedToken) {
            if (request.decodedToken.permissions.edit_kb_content || request.decodedToken.is_admin) {
                return db.query("INSERT INTO kb_article (section_id, article_name, article_content, article_author, article_last_updated, article_visibility) VALUES ($1, $2, $3, $4, $5, $6)", [article_section, article_name, article_content, request.decodedToken.evaluator_id, new Date(), article_visibility], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem creating this article.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to create knowledge base articles.");
            }
        }
        return handleNext(next, 401, "You must log in to create knowledge base articles.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while creating a knowledge base article.", error);
    }
};

exports.editArticle = (request, response, next) => {
    try {
        let {
            article_id,
            article_name,
            article_content,
            article_visibility,
            article_section,
            is_published
        } = request.body;

        if (request.decodedToken) {
            if (request.decodedToken.permissions.edit_kb_content || request.decodedToken.is_admin) {
                return db.query("SELECT article_visibility FROM kb_article WHERE article_id = $1", [article_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem editing this article.", res.error);
                    }
                    let current_visibility = res.rows[0].article_visibility;

                    if ((current_visibility === "Public" || current_visibility === "Evaluators Only") || request.decodedToken.is_admin) {
                        return db.query("UPDATE kb_article SET section_id = $1, article_name = $2, article_content = $3, article_author = $4, article_last_updated = $5, article_visibility = $6, is_published = $7 WHERE article_id = $8", [article_section, article_name, article_content, request.decodedToken.evaluator_id, new Date(), article_visibility, request.decodedToken.permissions.publish_kb_content || request.decodedToken.is_admin ? is_published : false, article_id], res => {
                            if (res.error) {
                                return handleNext(next, 400, "There was a problem editing this article.", res.error);
                            }
                            successMsg(response);
                        });
                    }
                });
            } else {
                return handleNext(next, 403, "You're not authorized to edit knowledge base articles.");
            }
        }
        return handleNext(next, 401, "You must log in to edit knowledge base articles.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while editing a knowledge base article.", error);
    }
};

exports.deleteArticle = (request, response, next) => {
    try {
        let {
            article_id
        } = request.body;

        if (request.decodedToken) {
            if (request.decodedToken.permissions.delete_kb_content || request.decodedToken.is_admin) {
                return db.query("DELETE FROM kb_article WHERE article_id = $1", [article_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting this article.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to delete knowledge base articles.");
            }
        }
        return handleNext(next, 401, "You must log in to delete knowledge base articles.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while deleting a knowledge base article.", error);
    }
};

exports.getArticleDraft = (request, response, next) => {
    try {
        if (request.decodedToken && (request.decodedToken.permissions.edit_kb_content || request.decodedToken.permissions.publish_kb_content || request.decodedToken.is_admin)) {
            let article_id = parseInt(document.query.articleId);

            if (article_id > 0) {
                return db.query("SELECT * FROM kb_article_draft WHERE article_id = $1 ORDER BY draft_last_updated DESC LIMIT 1;", [article_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem getting the requested article draft.", res.error);
                    }

                    response.json({
                        is_admin: request.decodedToken.is_admin,
                        logged_in: true,
                        draft: res.rows[0]
                    });
                });
            } else {
                return handleNext(next, 400, "You must specify an articleId.", new Error("Invalid article_id"));
            }
        } else {
            return handleNext(next, 403, "You're not authorized to retrieve article drafts.");
        }
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while retrieving a knowledge base article.", error);
    }
};

exports.addArticleDraft = (request, response, next) => {
    try {
        let {
            article_id,
            article_name,
            article_content
        } = request.body;

        if (request.decodedToken) {
            if (request.decodedToken.permissions.edit_kb_content || request.decodedToken.is_admin) {
                return db.query("INSERT INTO kb_article_draft (article_id, draft_name, draft_content, draft_author, draft_last_updated) VALUES ($1, $2, $3, $4, $5)", [article_id, article_name, article_content, request.decodedToken.evaluator_id, new Date()], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem creating this article draft.", res.error);
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "You're not authorized to edit knowledge base articles.");
            }
        }
        return handleNext(next, 401, "You must log in to edit knowledge base articles.");
    } catch (error) {
        return handleNext(next, 500, "Unexpected error while creating a knowledge base article draft.", error);
    }
};

module.exports = exports;
