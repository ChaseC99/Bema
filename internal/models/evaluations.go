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
	user := NewUserModel()

	evaluation.Entry = &entry
	evaluation.User = &user

	return evaluation
}

func GetEvaluationById(ctx context.Context, id int) (*model.Evaluation, error) {
	row := db.DB.QueryRow("SELECT ev.evaluation_id, ev.entry_id, ev.evaluator_id, ev.creativity, ev.complexity, ev.execution, ev.interpretation, to_char(ev.evaluation_tstz, $1), ev.evaluation_level, en.contest_id FROM evaluation ev INNER JOIN entry en ON en.entry_id = ev.entry_id WHERE evaluation_id = $2;", util.DisplayFancyDateFormat, id)

	e := NewEvaluationModel()
	var contestId int
	if err := row.Scan(&e.ID, &e.Entry.ID, &e.User.ID, &e.Creativity, &e.Complexity, &e.Execution, &e.Interpretation, &e.Created, &e.SkillLevel, &contestId); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "This evaluation does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving an evaluation.", err)
	}
	e.Total = e.Creativity + e.Complexity + e.Execution + e.Interpretation
	e.CanEdit = false

	currentContest, err := GetCurrentContest(ctx)
	if err != nil || currentContest == nil {
		return nil, err
	}

	user := auth.GetUserFromContext(ctx)

	if (contestId == currentContest.ID && e.User.ID == user.ID) || user.Permissions.EditAllEvaluations {
		e.CanEdit = true
	}

	return &e, nil
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

func EditEvaluationById(ctx context.Context, id int, input *model.EditEvaluationInput) error {
	_, err := db.DB.Exec("UPDATE evaluation SET creativity = $1, complexity = $2, execution = $3, interpretation = $4, evaluation_level = $5 WHERE evaluation_id = $6", input.Creativity, input.Complexity, input.Execution, input.Interpretation, input.SkillLevel, id)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while updating an evaluation.", err)
	}
	return nil
}
