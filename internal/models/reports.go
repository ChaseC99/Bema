package models

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
)

func GetUserProgressByContestId(ctx context.Context, userId int, contestId int) (*model.Progress, error) {
	p := &model.Progress{}

	row := db.DB.QueryRow("SELECT COUNT(*) FROM evaluation ev INNER JOIN entry en ON en.entry_id = ev.entry_id WHERE en.contest_id = $1 AND ev.evaluator_id = $2 AND ev.evaluation_complete = true;", contestId, userId)
	if err := row.Scan(&p.Count); err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the user's total evaluations for a contest", err)
	}

	row = db.DB.QueryRow("SELECT COUNT(*) FROM entry WHERE contest_id = $1 AND assigned_group_id = (SELECT group_id FROM evaluator WHERE evaluator_id = $2) AND flagged = false AND disqualified = false;", contestId, userId)
	if err := row.Scan(&p.Total); err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the user's total evaluations for a contest", err)
	}

	return p, nil
}

func GetGroupProgressByContestId(ctx context.Context, groupId int, contestId int) (*model.Progress, error) {
	p := &model.Progress{}

	row := db.DB.QueryRow("SELECT COUNT(*) FROM evaluation ev INNER JOIN entry en ON en.entry_id = ev.entry_id WHERE en.assigned_group_id = $1 AND en.contest_id = $2 AND en.disqualified = false AND en.flagged = false AND ev.evaluation_complete = true;", groupId, contestId)
	if err := row.Scan(&p.Count); err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the total number of evaluations for a group", err)
	}

	var entryCount int
	row = db.DB.QueryRow("SELECT COUNT(*) FROM entry WHERE contest_id = $1 AND assigned_group_id = $2 AND disqualified = false AND flagged = false;", contestId, groupId)
	if err := row.Scan(&entryCount); err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the total number of entries in a group", err)
	}

	var evaluatorCount int
	row = db.DB.QueryRow("SELECT COUNT(*) FROM evaluator e INNER JOIN evaluator_permissions p ON p.evaluator_id = e.evaluator_id WHERE e.group_id = $1 AND e.account_locked = false AND p.judge_entries = true;", groupId)
	if err := row.Scan(&evaluatorCount); err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the total number of evaluators in a group", err)
	}

	p.Total = entryCount * evaluatorCount

	return p, nil
}

func GetEntryProgressByContestId(ctx context.Context, contestId int) (*model.Progress, error) {
	p := &model.Progress{}

	row := db.DB.QueryRow("SELECT COUNT(*) FROM entry en WHERE en.contest_id = $1 AND en.flagged = false AND en.disqualified = false AND EXISTS (SELECT ev.evaluation_id FROM evaluation ev WHERE ev.entry_id = en.entry_id AND ev.evaluation_complete = true);", contestId)
	if err := row.Scan(&p.Count); err != nil {
		return nil, errors.NewInternalError(ctx, "", err)
	}

	row = db.DB.QueryRow("SELECT COUNT(*) FROM entry WHERE contest_id = $1 AND flagged = false AND disqualified = false;", contestId)
	if err := row.Scan(&p.Total); err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while determining the total number of entries for a contest", err)
	}

	return p, nil
}

func GetEvaluationProgressByContestId(ctx context.Context, contestId int) (*model.Progress, error) {
	p := &model.Progress{}

	row := db.DB.QueryRow("SELECT COUNT(*) FROM evaluation ev INNER JOIN entry en ON en.entry_id = ev.entry_id WHERE en.contest_id = $1 AND en.disqualified = false AND en.flagged = false AND ev.evaluation_complete = true;", contestId)
	if err := row.Scan(&p.Count); err != nil {
		return nil, errors.NewInternalError(ctx, "", err)
	}

	// Get the number of entries per group
	rows, err := db.DB.Query("SELECT assigned_group_id, COUNT(*) FROM entry WHERE contest_id = $1 AND disqualified = false AND flagged = false GROUP BY assigned_group_id ORDER BY assigned_group_id ASC;", contestId)
	if err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the entry count per group", err)
	}

	var groupEntries []struct {
		id    int
		count int
	}
	for rows.Next() {
		var count struct {
			id    int
			count int
		}
		rows.Scan(&count.id, &count.count)
		groupEntries = append(groupEntries, count)
	}

	// Get the number of evaluators per group
	rows, err = db.DB.Query("SELECT e.group_id, COUNT(*) FROM evaluator e INNER JOIN evaluator_permissions p ON p.evaluator_id = e.evaluator_id WHERE e.account_locked = false AND p.judge_entries = true GROUP BY group_id ORDER BY group_id ASC;")
	if err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the evaluator count per group", err)
	}

	var groupEvaluators []struct {
		id    int
		count int
	}
	for rows.Next() {
		var count struct {
			id    int
			count int
		}
		rows.Scan(&count.id, &count.count)
		groupEvaluators = append(groupEvaluators, count)
	}

	// Calculate expected number of evaluations
	var total int
	for _, en := range groupEntries {
		for _, ev := range groupEvaluators {
			if en.id == ev.id {
				total += en.count * ev.count
			}
		}
	}
	p.Total = total

	return p, nil
}
