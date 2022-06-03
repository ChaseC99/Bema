package models

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
)

func NewKBSectionModel() model.KBSection {
	section := model.KBSection{}
	return section
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

	rows, err := db.DB.Query("SELECT section_id, section_name, section_description, section_visibility FROM kb_section WHERE section_visibility = 'Evaluators Only' ORDER BY section_id ASC;")
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
