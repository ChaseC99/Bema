package models

import (
	"context"
	"database/sql"
	"time"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/util"
)

func NewKBSectionModel() model.KBSection {
	section := model.KBSection{}
	return section
}

func NewKBArticleModel() model.KBArticle {
	article := model.KBArticle{}

	section := NewKBSectionModel()
	user := NewUserModel()
	draft := NewKBArticleDraftModel()

	article.Author = &user
	article.Section = &section
	article.Draft = &draft

	return article
}

func NewKBArticleDraftModel() model.KBArticleDraft {
	draft := model.KBArticleDraft{}

	user := NewUserModel()

	draft.Author = &user

	return draft
}

func GetAllKBSections(ctx context.Context) ([]*model.KBSection, error) {
	sections := []*model.KBSection{}

	rows, err := db.DB.Query("SELECT section_id, section_name, section_description, section_visibility FROM kb_section ORDER BY section_id ASC;")
	if err != nil {
		return []*model.KBSection{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of KB sections", err)
	}

	for rows.Next() {
		s := NewKBSectionModel()

		if err := rows.Scan(&s.ID, &s.Name, &s.Description, &s.Visibility); err != nil {
			return []*model.KBSection{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of KB sections", err)
		}

		sections = append(sections, &s)
	}

	return sections, nil
}

func GetAllKBArticles(ctx context.Context) ([]*model.KBArticle, error) {
	articles := []*model.KBArticle{}

	rows, err := db.DB.Query("SELECT article_id, section_id, article_name, article_content, article_author, to_char(article_last_updated, $1), article_visibility, is_published FROM kb_article ORDER BY section_id ASC, article_id ASC;", util.DisplayFancyDateFormat)
	if err != nil {
		return []*model.KBArticle{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of KB articles", err)
	}

	for rows.Next() {
		a := NewKBArticleModel()

		if err := rows.Scan(&a.ID, &a.Section.ID, &a.Title, &a.Content, &a.Author.ID, &a.LastUpdated, &a.Visibility, &a.IsPublished); err != nil {
			return []*model.KBArticle{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of KB articles", err)
		}

		articles = append(articles, &a)
	}

	return articles, nil
}

func GetAllKBArticlesWithDrafts(ctx context.Context) ([]*model.KBArticle, error) {
	articles := []*model.KBArticle{}

	rows, err := db.DB.Query("SELECT a.article_id, a.section_id, a.article_name, a.article_content, a.article_author, to_char(a.article_last_updated, $1), a.article_visibility, a.is_published, d.draft_id FROM kb_article a INNER JOIN kb_article_draft d ON d.article_id = a.article_id WHERE d.is_published = false ORDER BY d.draft_last_updated DESC;", util.DisplayFancyDateFormat)
	if err != nil {
		return []*model.KBArticle{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of KB articles with drafts", err)
	}

	for rows.Next() {
		a := NewKBArticleModel()

		if err := rows.Scan(&a.ID, &a.Section.ID, &a.Title, &a.Content, &a.Author.ID, &a.LastUpdated, &a.Visibility, &a.IsPublished, &a.Draft.ID); err != nil {
			return []*model.KBArticle{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of KB articles with drafts", err)
		}

		articles = append(articles, &a)
	}

	return articles, nil
}

func GetPublicKBSections(ctx context.Context) ([]*model.KBSection, error) {
	sections := []*model.KBSection{}

	rows, err := db.DB.Query("SELECT section_id, section_name, section_description, section_visibility FROM kb_section WHERE section_visibility = 'Public' ORDER BY section_id ASC;")
	if err != nil {
		return []*model.KBSection{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of KB sections", err)
	}

	for rows.Next() {
		s := NewKBSectionModel()

		if err := rows.Scan(&s.ID, &s.Name, &s.Description, &s.Visibility); err != nil {
			return []*model.KBSection{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of KB sections", err)
		}

		sections = append(sections, &s)
	}

	return sections, nil
}

func GetEvaluatorKBSections(ctx context.Context) ([]*model.KBSection, error) {
	sections := []*model.KBSection{}

	rows, err := db.DB.Query("SELECT section_id, section_name, section_description, section_visibility FROM kb_section WHERE section_visibility = 'Evaluators Only' OR section_visibility = 'Public' ORDER BY section_id ASC;")
	if err != nil {
		return []*model.KBSection{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of KB sections", err)
	}

	for rows.Next() {
		s := NewKBSectionModel()

		if err := rows.Scan(&s.ID, &s.Name, &s.Description, &s.Visibility); err != nil {
			return []*model.KBSection{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of KB sections", err)
		}

		sections = append(sections, &s)
	}

	return sections, nil
}

func GetKBSectionById(ctx context.Context, id int) (*model.KBSection, error) {
	row := db.DB.QueryRow("SELECT section_id, section_name, section_description, section_visibility FROM kb_section WHERE section_id = $1", id)

	s := NewKBSectionModel()
	if err := row.Scan(&s.ID, &s.Name, &s.Description, &s.Visibility); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "This section does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving a KB section", err)
	}

	return &s, nil
}

func GetKBArticleById(ctx context.Context, id int) (*model.KBArticle, error) {
	row := db.DB.QueryRow("SELECT article_id, section_id, article_name, article_content, article_author, to_char(article_last_updated, $1), article_visibility, is_published FROM kb_article WHERE article_id = $2", util.DisplayFancyDateFormat, id)

	a := NewKBArticleModel()
	if err := row.Scan(&a.ID, &a.Section.ID, &a.Title, &a.Content, &a.Author.ID, &a.LastUpdated, &a.Visibility, &a.IsPublished); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "This article does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving a KB article.", err)
	}

	return &a, nil
}

func CheckKBArticleHasDraft(ctx context.Context, id int) (bool, error) {
	row := db.DB.QueryRow("SELECT COUNT(*) FROM kb_article_draft WHERE article_id = $1 AND is_published = false;", id)

	var count *int
	if err := row.Scan(&count); err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, errors.NewInternalError(ctx, "An unexpected error occurred while checking if a KB article has a draft.", err)
	}

	if *count > 0 {
		return true, nil
	}
	return false, nil
}

func GetPublicKBArticlesBySection(ctx context.Context, sectionId int) ([]*model.KBArticle, error) {
	articles := []*model.KBArticle{}

	rows, err := db.DB.Query("SELECT article_id, section_id, article_name, article_content, article_author, to_char(article_last_updated, $1), article_visibility, is_published FROM kb_article WHERE section_id = $2 AND article_visibility = 'Public' AND is_published = true ORDER BY article_id ASC", util.DisplayFancyDateFormat, sectionId)
	if err != nil {
		return []*model.KBArticle{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving articles for a KB section", err)
	}

	for rows.Next() {
		a := NewKBArticleModel()

		if err := rows.Scan(&a.ID, &a.Section.ID, &a.Title, &a.Content, &a.Author.ID, &a.LastUpdated, &a.Visibility, &a.IsPublished); err != nil {
			return []*model.KBArticle{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading articles for a KB section", err)
		}

		articles = append(articles, &a)
	}

	return articles, nil
}

func GetEvaluatorKBArticlesBySection(ctx context.Context, sectionId int) ([]*model.KBArticle, error) {
	articles := []*model.KBArticle{}

	rows, err := db.DB.Query("SELECT article_id, section_id, article_name, article_content, article_author, to_char(article_last_updated, $1), article_visibility, is_published FROM kb_article WHERE section_id = $2 AND (article_visibility = 'Public' OR article_visibility = 'Evaluators Only') AND is_published = true ORDER BY article_id ASC", util.DisplayFancyDateFormat, sectionId)
	if err != nil {
		return []*model.KBArticle{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving articles for a KB section", err)
	}

	for rows.Next() {
		a := NewKBArticleModel()

		if err := rows.Scan(&a.ID, &a.Section.ID, &a.Title, &a.Content, &a.Author.ID, &a.LastUpdated, &a.Visibility, &a.IsPublished); err != nil {
			return []*model.KBArticle{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading articles for a KB section", err)
		}

		articles = append(articles, &a)
	}

	return articles, nil
}

func GetAdminKBArticlesBySection(ctx context.Context, sectionId int) ([]*model.KBArticle, error) {
	articles := []*model.KBArticle{}

	rows, err := db.DB.Query("SELECT article_id, section_id, article_name, article_content, article_author, to_char(article_last_updated, $1), article_visibility, is_published FROM kb_article WHERE section_id = $1 ORDER BY article_id ASC", util.DisplayFancyDateFormat, sectionId)
	if err != nil {
		return []*model.KBArticle{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving articles for a KB section", err)
	}

	for rows.Next() {
		a := NewKBArticleModel()

		if err := rows.Scan(&a.ID, &a.Section.ID, &a.Title, &a.Content, &a.Author.ID, &a.LastUpdated, &a.Visibility, &a.IsPublished); err != nil {
			return []*model.KBArticle{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading articles for a KB section", err)
		}

		articles = append(articles, &a)
	}

	return articles, nil
}

func GetKBArticleDraftByArticleId(ctx context.Context, articleId int) (*model.KBArticleDraft, error) {
	row := db.DB.QueryRow("SELECT draft_id, draft_name, draft_content, draft_author, to_char(draft_last_updated, $1) FROM kb_article_draft WHERE article_id = $2 AND is_published = false ORDER BY draft_id DESC LIMIT 1;", util.DisplayFancyDateFormat, articleId)

	d := NewKBArticleDraftModel()
	if err := row.Scan(&d.ID, &d.Title, &d.Content, &d.Author.ID, &d.LastUpdated); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving an article draft", err)
	}

	return &d, nil
}

func CreateKBSection(ctx context.Context, input *model.KBSectionInput) (*int, error) {
	row := db.DB.QueryRow("INSERT INTO kb_section (section_name, section_description, section_visibility) VALUES ($1, $2, $3) RETURNING section_id;", input.Name, input.Description, input.Visibility)

	var id int
	if err := row.Scan(&id); err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while creating a KB section", err)
	}

	return &id, nil
}

func EditKBSectionById(ctx context.Context, id int, input *model.KBSectionInput) error {
	_, err := db.DB.Exec("UPDATE kb_section SET section_name = $1, section_description = $2, section_visibility = $3 WHERE section_id = $4;", input.Name, input.Description, input.Visibility, id)

	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while updating a KB section", err)
	}

	return nil
}

func DeleteKBSectionById(ctx context.Context, id int) error {
	_, err := db.DB.Exec("DELETE FROM kb_section WHERE section_id = $1;", id)

	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while deleting a KB section", err)
	}

	return nil
}

func CreateKBArticle(ctx context.Context, input *model.KBArticleInput, authorId int) (*int, error) {
	articleRow := db.DB.QueryRow("INSERT INTO kb_article (section_id, article_name, article_content, article_author, article_last_updated, article_visibility, is_published) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING article_id;", input.Section, input.Title, "", authorId, time.Now(), input.Visibility, false)

	var id int
	if err := articleRow.Scan(&id); err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while creating a KB article", err)
	}

	_, err := db.DB.Exec("INSERT INTO kb_article_draft (article_id, draft_name, draft_content, draft_author, draft_last_updated, is_published) VALUES ($1, $2, $3, $4, $5, $6);", id, input.Title, input.Content, authorId, time.Now(), false)
	if err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while creating a KB article draft", err)
	}

	return &id, nil
}

func EditKBArticle(ctx context.Context, articleId int, input *model.KBArticleInput, authorId int) error {
	draftRow := db.DB.QueryRow("SELECT draft_id FROM kb_article_draft WHERE article_id = $1 AND is_published = false;", articleId)

	var draftId *int
	if err := draftRow.Scan(&draftId); err != nil {
		if err == sql.ErrNoRows {
			draftId = nil
		} else {
			return errors.NewInternalError(ctx, "An unexpected error occurred while looking up an article's most recent draft", err)
		}
	}

	if draftId == nil {
		// A draft does not exist, so create a new one
		_, err := db.DB.Exec("INSERT INTO kb_article_draft (article_id, draft_name, draft_content, draft_author, draft_last_updated, is_published) VALUES ($1, $2, $3, $4, $5, $6);", articleId, input.Title, input.Content, authorId, time.Now(), false)

		if err != nil {
			return errors.NewInternalError(ctx, "An unexpected error occurred while creating a KB article draft", err)
		}
	} else {
		// A draft already exists, so just update it
		_, err := db.DB.Exec("UPDATE kb_article_draft SET draft_name = $1, draft_content = $2, draft_author = $3, draft_last_updated = $4 WHERE draft_id = $5;", input.Title, input.Content, authorId, time.Now(), draftId)

		if err != nil {
			return errors.NewInternalError(ctx, "An unexpected error occurred while updating a KB article draft", err)
		}
	}

	return nil
}

func EditKBArticleProperties(ctx context.Context, id int, visibility string, sectionId int) error {
	_, err := db.DB.Exec("UPDATE kb_article SET article_visibility = $1, section_id = $2 WHERE article_id = $3;", visibility, sectionId, id)

	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while updating an article's properties", err)
	}

	return nil
}

func DeleteKBArticle(ctx context.Context, articleId int) error {
	_, err := db.DB.Exec("DELETE FROM kb_article WHERE article_id = $1", articleId)

	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while deleting a KB article", err)
	}

	return nil
}

func DeleteKBArticleDraft(ctx context.Context, draftId int) error {
	_, err := db.DB.Exec("DELETE FROM kb_article_draft WHERE draft_id = $1", draftId)

	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while deleting a KB article draft", err)
	}

	return nil
}

func PublishKBArticle(ctx context.Context, id int) error {
	row := db.DB.QueryRow("SELECT draft_id, draft_name, draft_content, draft_author FROM kb_article_draft WHERE article_id = $1 AND is_published = false", id)

	var draftId, draftAuthor int
	var draftName, draftContent string

	if err := row.Scan(&draftId, &draftName, &draftContent, &draftAuthor); err != nil {
		if err == sql.ErrNoRows {
			return errors.NewNotFoundError(ctx, "Oops! An unpublished draft does not exist for this article.")
		}
		return errors.NewInternalError(ctx, "An unexpected error occurred while publishing a KB article", err)
	}

	_, err := db.DB.Exec("UPDATE kb_article SET article_name = $1, article_content = $2, article_author = $3, article_last_updated = $4, is_published = $5 WHERE article_id = $6", draftName, draftContent, draftAuthor, time.Now(), true, id)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while publishing a KB article", err)
	}

	_, err = db.DB.Exec("UPDATE kb_article_draft SET is_published = $1 WHERE draft_id = $2", true, draftId)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while publishing a KB article", err)
	}

	return nil
}

func UnpublishKBArticle(ctx context.Context, id int) error {
	_, err := db.DB.Exec("UPDATE kb_article SET is_published = false WHERE article_id = $1;", id)

	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while unpublishing a KB article", err)
	}

	return nil
}
