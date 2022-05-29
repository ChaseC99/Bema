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
