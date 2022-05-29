package models

import (
	"context"
	"database/sql"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
)

func GetContestantByKaid(ctx context.Context, kaid string) (*model.Contestant, error) {
	row := db.DB.QueryRow("SELECT entry_author FROM entry WHERE entry_author_kaid = $1 ORDER BY entry_id ASC LIMIT 1;", kaid)

	contestant := &model.Contestant{}
	contestant.Kaid = kaid
	if err := row.Scan(&contestant.Name); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "The requested contestant does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while looking up a contestant.", err)
	}

	return contestant, nil
}

func GetContestantEntryCount(ctx context.Context, kaid string) (int, error) {
	row := db.DB.QueryRow("SELECT COUNT(entry_id) FROM entry WHERE entry_author_kaid = $1;", kaid)

	var entryCount int
	if err := row.Scan(&entryCount); err != nil {
		if err == sql.ErrNoRows {
			return 0, errors.NewNotFoundError(ctx, "The requested contestant does not exist.")
		}
		return 0, errors.NewInternalError(ctx, "An unexpected error occurred while determining a contestant's entry count", err)
	}

	return entryCount, nil
}

func GetContestantContestCount(ctx context.Context, kaid string) (int, error) {
	row := db.DB.QueryRow("SELECT COUNT(*) FROM contest c WHERE EXISTS (SELECT e.entry_id FROM entry e WHERE e.entry_author_kaid = $1 AND e.contest_id = c.contest_id);", kaid)

	var contestCount int
	if err := row.Scan(&contestCount); err != nil {
		if err == sql.ErrNoRows {
			return 0, errors.NewNotFoundError(ctx, "The requested contestant does not exist.")
		}
		return 0, errors.NewInternalError(ctx, "An unexpected error occurred while determining a contestant's contest count", err)
	}

	return contestCount, nil
}
