package models

import (
	"context"
	"database/sql"
	"strings"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
)

func NewContestantModel() model.Contestant {
	contestant := model.Contestant{}
	contestant.Entries = []*model.Entry{}

	return contestant
}

func GetContestantByKaid(ctx context.Context, kaid string) (*model.Contestant, error) {
	row := db.DB.QueryRow("SELECT entry_author FROM entry WHERE entry_author_kaid = $1 ORDER BY entry_id ASC LIMIT 1;", kaid)

	contestant := NewContestantModel()
	contestant.Kaid = kaid
	if err := row.Scan(&contestant.Name); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "The requested contestant does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while looking up a contestant.", err)
	}

	return &contestant, nil
}

func GetContestantsBySearchQuery(ctx context.Context, searchQuery string) ([]*model.Contestant, error) {
	contestants := []*model.Contestant{}

	var query string
	if strings.Contains(searchQuery, "kaid_") {
		query = "SELECT entry_author, entry_author_kaid FROM entry WHERE entry_author_kaid LIKE $1 ORDER BY entry_id DESC LIMIT 1;"
	} else {
		query = "SELECT STRING_AGG(DISTINCT entry_author, ', ') as contestant_names, entry_author_kaid as contestant_kaid FROM entry WHERE entry_author LIKE $1 GROUP BY entry_author_kaid;"
	}

	rows, err := db.DB.Query(query, "%"+searchQuery+"%")
	if err != nil {
		return []*model.Contestant{}, errors.NewInternalError(ctx, "An unexpected error occurred while searching for contestants.", err)
	}

	for rows.Next() {
		c := NewContestantModel()
		var kaid *string

		if err := rows.Scan(&c.Name, &kaid); err != nil {
			return []*model.Contestant{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading contestants matching a search query.", err)
		}

		if kaid == nil {
			c.Kaid = ""
		} else {
			c.Kaid = *kaid
		}

		contestants = append(contestants, &c)
	}

	return contestants, nil
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
