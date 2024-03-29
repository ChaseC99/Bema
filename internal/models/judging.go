package models

import (
	"context"
	"database/sql"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
)

func NewJudgingGroupModel() model.JudgingGroup {
	group := model.JudgingGroup{}
	return group
}

func NewJudgingCriteriaModel() model.JudgingCriteria {
	criteria := model.JudgingCriteria{}
	return criteria
}

func GetAllCriteria(ctx context.Context) ([]*model.JudgingCriteria, error) {
	criteria := []*model.JudgingCriteria{}

	rows, err := db.DB.Query("SELECT criteria_id, criteria_name, criteria_description, is_active, sort_order FROM judging_criteria ORDER BY is_active DESC, sort_order ASC;")
	if err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of judging criteria", err)
	}

	for rows.Next() {
		c := NewJudgingCriteriaModel()
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
		c := NewJudgingCriteriaModel()
		if err := rows.Scan(&c.ID, &c.Name, &c.Description, &c.IsActive, &c.SortOrder); err != nil {
			return nil, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of active judging criteria", err)
		}
		criteria = append(criteria, &c)
	}

	return criteria, nil
}

func GetJudgingCriteriaById(ctx context.Context, id int) (*model.JudgingCriteria, error) {
	row := db.DB.QueryRow("SELECT criteria_id, criteria_name, criteria_description, is_active, sort_order FROM judging_criteria WHERE criteria_id = $1;", id)

	criteria := NewJudgingCriteriaModel()
	if err := row.Scan(&criteria.ID, &criteria.Name, &criteria.Description, &criteria.IsActive, &criteria.SortOrder); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "This criteria does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occrrued while retrieving a judging criteria", err)
	}

	return &criteria, nil
}

func CreateJudgingCriteria(ctx context.Context, input *model.JudgingCriteriaInput) (*int, error) {
	row := db.DB.QueryRow("INSERT INTO judging_criteria (criteria_name, criteria_description, is_active, sort_order) VALUES ($1, $2, $3, $4) RETURNING criteria_id;", input.Name, input.Description, input.IsActive, input.SortOrder)

	var id *int
	if err := row.Scan(&id); err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while creating a judging criteria", err)
	}

	return id, nil
}

func EditJudgingCriteriaById(ctx context.Context, id int, input *model.JudgingCriteriaInput) error {
	_, err := db.DB.Exec("UPDATE judging_criteria SET criteria_name = $1, criteria_description = $2, is_active = $3, sort_order = $4 WHERE criteria_id = $5;", input.Name, input.Description, input.IsActive, input.SortOrder, id)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while editing a judging criteria", err)
	}

	return nil
}

func DeleteJudgingCriteriaById(ctx context.Context, id int) error {
	_, err := db.DB.Exec("DELETE FROM judging_criteria WHERE criteria_id = $1;", id)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while deleting a judging criteria", err)
	}

	return nil
}

func GetAllJudgingGroups(ctx context.Context) ([]*model.JudgingGroup, error) {
	groups := []*model.JudgingGroup{}

	rows, err := db.DB.Query("SELECT group_id, group_name, is_active FROM evaluator_group ORDER BY group_id ASC;")
	if err != nil {
		return []*model.JudgingGroup{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of judging groups", err)
	}

	for rows.Next() {
		g := NewJudgingGroupModel()
		if err := rows.Scan(&g.ID, &g.Name, &g.IsActive); err != nil {
			return []*model.JudgingGroup{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of judging groups", err)
		}
		groups = append(groups, &g)
	}

	return groups, nil
}

func GetActiveJudgingGroups(ctx context.Context) ([]*model.JudgingGroup, error) {
	groups := []*model.JudgingGroup{}

	rows, err := db.DB.Query("SELECT group_id, group_name, is_active FROM evaluator_group WHERE is_active = true ORDER BY group_id ASC;")
	if err != nil {
		return []*model.JudgingGroup{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of active judging groups", err)
	}

	for rows.Next() {
		g := NewJudgingGroupModel()
		if err := rows.Scan(&g.ID, &g.Name, &g.IsActive); err != nil {
			return []*model.JudgingGroup{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of active judging groups", err)
		}
		groups = append(groups, &g)
	}

	return groups, nil
}

func GetJudgingGroupById(ctx context.Context, id int) (*model.JudgingGroup, error) {
	row := db.DB.QueryRow("SELECT group_id, group_name, is_active FROM evaluator_group WHERE group_id = $1;", id)

	group := NewJudgingGroupModel()
	err := row.Scan(&group.ID, &group.Name, &group.IsActive)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "Oops! The requested judging group does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while looking up a judging group", err)
	}

	return &group, nil
}

func CreateJudgingGroup(ctx context.Context, input *model.CreateJudgingGroupInput) (*int, error) {
	row := db.DB.QueryRow("INSERT INTO evaluator_group (group_name) VALUES ($1) RETURNING group_id;", input.Name)

	var id *int
	if err := row.Scan(&id); err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while creating a judging group", err)
	}

	return id, nil
}

func EditJudgingGroupById(ctx context.Context, id int, input *model.EditJudgingGroupInput) error {
	_, err := db.DB.Exec("UPDATE evaluator_group SET group_name = $1, is_active = $2 WHERE group_id = $3;", input.Name, input.IsActive, id)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while editing a judging group", err)
	}

	return nil
}

func DeleteJudgingGroupById(ctx context.Context, id int) error {
	_, err := db.DB.Exec("DELETE FROM evaluator_group WHERE group_id = $1;", id)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while deleting a judging group", err)
	}
	return nil
}

func ScoreEntry(ctx context.Context, userId int, entryId int, input *model.ScoreEntryInput) (*int, error) {
	_, err := db.DB.Exec("SELECT evaluate($1, $2, $3, $4, $5, $6, $7)", entryId, userId, input.Creativity, input.Complexity, input.Execution, input.Interpretation, input.SkillLevel)
	if err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while submitting scores for an entry", err)
	}

	row := db.DB.QueryRow("SELECT evaluation_id FROM evaluation WHERE entry_id = $1 AND evaluator_id = $2 LIMIT 1;", entryId, userId)

	var evaluationId *int
	if err := row.Scan(&evaluationId); err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while submitting scores for an entry", err)
	}

	return evaluationId, nil
}

func AutoUpdateEntryLevel(ctx context.Context, entryId int) error {
	rows, err := db.DB.Query("SELECT entry_level FROM entry WHERE entry_author_kaid = (SELECT entry_author_kaid FROM entry WHERE entry_id = $1) AND entry_id != $1 ORDER BY entry_id DESC LIMIT 3;", entryId)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while updating an entry's skill level", err)
	}

	levels := []string{}
	for rows.Next() {
		var level string
		if err := rows.Scan(&level); err != nil {
			return errors.NewInternalError(ctx, "An unexpected error occurred while updating an entry's skill level", err)
		}
		levels = append(levels, level)
	}

	if len(levels) == 3 && levels[0] == "Advanced" && levels[1] == "Advanced" && levels[2] == "Advanced" {
		_, err := db.DB.Exec("UPDATE entry SET entry_level = 'Advanced', entry_level_locked = true WHERE entry_id = $1;", entryId)
		if err != nil {
			return errors.NewInternalError(ctx, "An unexpected error occurred while updating an entry's skill level", err)
		}
	} else {
		_, err = db.DB.Exec("SELECT update_entry_level($1);", entryId)
		if err != nil {
			return errors.NewInternalError(ctx, "An unexpected error occurred while updating an entry's skill level", err)
		}
	}

	return nil
}
