/** Handlers for the knowledge base sections and articles **/

const {
  handleNext,
  successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const { displayDateFormat } = require(process.cwd() + "/util/variables");

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
      article_content
    } = request.body;

    if (request.decodedToken) {
      if (request.decodedToken.permissions.publish_kb_content || request.decodedToken.is_admin) {
        return db.query("SELECT article_visibility FROM kb_article WHERE article_id = $1", [article_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem editing this article.", res.error);
          }
          let current_visibility = res.rows[0].article_visibility;

          if ((current_visibility === "Public" || current_visibility === "Evaluators Only") || request.decodedToken.is_admin) {
            return db.query("UPDATE kb_article SET article_name = $1, article_content = $2, article_author = $3, article_last_updated = $4, is_published = true WHERE article_id = $5", [article_name, article_content, request.decodedToken.evaluator_id, new Date(), article_id], res => {
              if (res.error) {
                return handleNext(next, 400, "There was a problem editing this article.", res.error);
              }
              return db.query("DELETE FROM kb_article_draft WHERE article_id = $1", [article_id], res => {
                if (res.error) {
                  return handleNext(next, 400, "There was a problem deleting the article drafts.", res.error);
                }
                successMsg(response);
              });
            });
          } else {
            return handleNext(next, 403, "You're not authorized to edit this article.");
          }
        });
      } else {
        return handleNext(next, 403, "You're not authorized to publish knowledge base articles.");
      }
    }
    return handleNext(next, 401, "You must log in to edit knowledge base articles.");
  } catch (error) {
    return handleNext(next, 500, "Unexpected error while editing a knowledge base article.", error);
  }
};

exports.editArticleProperties = (request, response, next) => {
  try {
    let {
      article_id,
      article_section,
      article_visibility,
      is_published
    } = request.body;

    if (request.decodedToken) {
      if (request.decodedToken.is_admin) {
        return db.query("UPDATE kb_article SET section_id = $1, article_visibility = $2, is_published = $3 WHERE article_id = $4", [article_section, article_visibility, is_published, article_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem editing this article.", res.error);
          }
          successMsg(response);
        });
      } else {
        return handleNext(next, 403, "You're not authorized to edit knowledge base article properties.");
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

exports.editArticleDraft = (request, response, next) => {
  try {
    let {
      draft_id,
      article_name,
      article_content
    } = request.body;

    if (request.decodedToken) {
      if (request.decodedToken.permissions.edit_kb_content || request.decodedToken.is_admin) {
        return db.query("UPDATE kb_article_draft SET draft_name = $1, draft_content = $2, draft_author = $3, draft_last_updated = $4 WHERE draft_id = $5", [article_name, article_content, request.decodedToken.evaluator_id, new Date(), draft_id], res => {
          if (res.error) {
            return handleNext(next, 400, "There was a problem updating this article draft.", res.error);
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