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

	article.Author = &model.User{}
	article.Section = &section

	return article
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
