package models

import (
	"context"
	"database/sql"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
)

func NewKBSectionModel() model.KBSection {
	section := model.KBSection{}
	return section
}

func NewKBArticleModel() model.KBArticle {
	article := model.KBArticle{}

	section := NewKBSectionModel()
	user := NewUserModel()

	article.Author = &user
	article.Section = &section

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
	row := db.DB.QueryRow("SELECT article_id, section_id, article_name, article_content, article_author, article_last_updated, article_visibility, is_published FROM kb_article WHERE article_id = $1", id)

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
	row := db.DB.QueryRow("SELECT COUNT(*) FROM kb_article_draft WHERE article_id = $1", id)

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

	rows, err := db.DB.Query("SELECT article_id, section_id, article_name, article_content, article_author, article_last_updated, article_visibility, is_published FROM kb_article WHERE section_id = $1 AND article_visibility = 'Public' AND is_published = true ORDER BY article_id ASC", sectionId)
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

	rows, err := db.DB.Query("SELECT article_id, section_id, article_name, article_content, article_author, article_last_updated, article_visibility, is_published FROM kb_article WHERE section_id = $1 AND (article_visibility = 'Public' OR article_visibility = 'Evaluators Only') AND is_published = true ORDER BY article_id ASC", sectionId)
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

	rows, err := db.DB.Query("SELECT article_id, section_id, article_name, article_content, article_author, article_last_updated, article_visibility, is_published FROM kb_article WHERE section_id = $1 ORDER BY article_id ASC", sectionId)
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
	row := db.DB.QueryRow("SELECT draft_id, draft_name, draft_content, draft_author, draft_last_updated FROM kb_article_draft WHERE article_id = $1", articleId)

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
