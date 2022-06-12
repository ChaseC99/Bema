package models

import (
	"context"
	"database/sql"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/util"
)

func NewEvaluationModel() model.Evaluation {
	evaluation := model.Evaluation{}
	entry := NewEntryModel()

	evaluation.Entry = &entry
	evaluation.User = &model.User{}

	return evaluation
}

func GetEvaluationsForUserAndContest(ctx context.Context, userId int, contestId int) ([]*model.Evaluation, error) {
	evaluations := []*model.Evaluation{}
	user := auth.GetUserFromContext(ctx)

	currentContest, err := GetCurrentContest(ctx)
	if err != nil || currentContest == nil {
		return []*model.Evaluation{}, err
	}

	rows, err := db.DB.Query("SELECT ev.evaluation_id, ev.entry_id, ev.evaluator_id, ev.creativity, ev.complexity, ev.execution, ev.interpretation, to_char(ev.evaluation_tstz, $1), ev.evaluation_level FROM evaluation ev INNER JOIN entry e ON e.entry_id = ev.entry_id WHERE ev.evaluator_id = $2 AND e.contest_id = $3 AND ev.evaluation_complete = true ORDER BY ev.evaluation_id ASC;", util.DisplayFancyDateFormat, userId, contestId)
	if err != nil {
		return []*model.Evaluation{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of evaluations", err)
	}

	for rows.Next() {
		e := NewEvaluationModel()
		if err := rows.Scan(&e.ID, &e.Entry.ID, &e.User.ID, &e.Creativity, &e.Complexity, &e.Execution, &e.Interpretation, &e.Created, &e.SkillLevel); err != nil {
			return []*model.Evaluation{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of evaluations", err)
		}
		e.Total = e.Creativity + e.Complexity + e.Execution + e.Interpretation
		e.CanEdit = false

		if (contestId == currentContest.ID && userId == user.ID) || user.Permissions.EditAllEvaluations {
			e.CanEdit = true
		}

		evaluations = append(evaluations, &e)
	}

	return evaluations, nil
}

func GetUserTotalEvaluations(ctx context.Context, userId int) (*int, error) {
	row := db.DB.QueryRow("SELECT COUNT(*) FROM evaluation WHERE evaluator_id = $1 AND evaluation_complete = true;", userId)

	var count *int
	if err := row.Scan(&count); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving a user's total evaluations", err)
	}

	return count, nil
}

func GetUserTotalContestsJudged(ctx context.Context, userId int) (*int, error) {
	row := db.DB.QueryRow("SELECT COUNT(*) FROM contest c WHERE EXISTS (SELECT evaluation_id FROM evaluation ev INNER JOIN entry en ON en.entry_id = ev.entry_id WHERE en.contest_id = c.contest_id AND ev.evaluator_id = $1 AND ev.evaluation_complete = true);", userId)

	var count *int
	if err := row.Scan(&count); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving a user's total contests judged", err)
	}

	return count, nil
}
