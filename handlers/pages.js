const {
  handleNext,
  jsonMessage
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const { displayDateFormat, displayFancyDateFormat, publicPermissions } = require(process.cwd() + "/util/variables");

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
      } else if ((!request.decodedToken && res.rows[0].article_visibility !== "Public") ||
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