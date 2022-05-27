package models

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
)

func GetAllCriteria(ctx context.Context) ([]*model.JudgingCriteria, error) {
	criteria := []*model.JudgingCriteria{}

	rows, err := db.DB.Query("SELECT criteria_id, criteria_name, criteria_description, is_active, sort_order FROM judging_criteria ORDER BY is_active DESC, sort_order ASC;")
	if err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of judging criteria", err)
	}

	for rows.Next() {
		var c model.JudgingCriteria
		if err := rows.Scan(&c.ID, &c.Name, &c.Description, &c.IsActive, &c.SortOrder); err != nil {
			return nil, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of judging criteria", err)
		}
		criteria = append(criteria, &c)
	}

	return criteria, nil
}

func GetPublicCriteria(ctx context.Context) ([]*model.JudgingCriteria, error) {
	return []*model.JudgingCriteria{
		{
			ID:          1,
			Name:        "CRITERIA 1",
			Description: "An explanation of what criteria 1 means goes here.",
			IsActive:    true,
			SortOrder:   1,
		},
		{
			ID:          2,
			Name:        "CRITERIA 2",
			Description: "An explanation of what criteria 2 means goes here.",
			IsActive:    true,
			SortOrder:   2,
		},
		{
			ID:          3,
			Name:        "CRITERIA 3",
			Description: "An explanation of what criteria 3 means goes here.",
			IsActive:    true,
			SortOrder:   3,
		},
		{
			ID:          4,
			Name:        "CRITERIA 4",
			Description: "An explanation of what criteria 4 means goes here.",
			IsActive:    true,
			SortOrder:   4,
		},
	}, nil
}

func GetActiveCriteria(ctx context.Context) ([]*model.JudgingCriteria, error) {
	criteria := []*model.JudgingCriteria{}

	rows, err := db.DB.Query("SELECT criteria_id, criteria_name, criteria_description, is_active, sort_order FROM judging_criteria WHERE is_active = true ORDER BY sort_order ASC;")
	if err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of active judging criteria", err)
	}

	for rows.Next() {
		var c model.JudgingCriteria
		if err := rows.Scan(&c.ID, &c.Name, &c.Description, &c.IsActive, &c.SortOrder); err != nil {
			return nil, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of active judging criteria", err)
		}
		criteria = append(criteria, &c)
	}

	return criteria, nil
}
