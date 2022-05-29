package models

import (
	"context"
	"database/sql"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/util"
)

func newEntry() model.Entry {
	var entry model.Entry

	entry.Author = &model.Contestant{}
	entry.Contest = &model.Contest{}
	entry.Group = &model.JudgingGroup{}

	return entry
}

func GetEntriesByContestId(ctx context.Context, contestId int) ([]*model.Entry, error) {
	entries := []*model.Entry{}

	rows, err := db.DB.Query("SELECT entry_id, contest_id, entry_url, entry_kaid, entry_title, entry_level, entry_votes, to_char(entry_created, $1) as entry_created, entry_height, is_winner, assigned_group_id, flagged, disqualified, entry_author_kaid, entry_level_locked FROM entry WHERE contest_id = $2 ORDER BY entry_id ASC;", util.DisplayFancyDateFormat, contestId)
	if err != nil {
		return []*model.Entry{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of entries.", err)
	}

	for rows.Next() {
		entry := newEntry()

		if err := rows.Scan(&entry.ID, &entry.Contest.ID, &entry.URL, &entry.Kaid, &entry.Title, &entry.SkillLevel, &entry.Votes, &entry.Created, &entry.Height, &entry.IsWinner, &entry.Group.ID, &entry.IsFlagged, &entry.IsDisqualified, &entry.Author.Kaid, &entry.IsSkillLevelLocked); err != nil {
			return []*model.Entry{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of entries.", err)
		}

		entries = append(entries, &entry)
	}

	return entries, nil
}

func GetEntryById(ctx context.Context, id int) (*model.Entry, error) {
	row := db.DB.QueryRow("SELECT entry_id, contest_id, entry_url, entry_kaid, entry_title, entry_level, entry_votes, to_char(entry_created, $1) as entry_created, entry_height, is_winner, assigned_group_id, flagged, disqualified, entry_author_kaid, entry_level_locked FROM entry WHERE entry_id = $2;", util.DisplayFancyDateFormat, id)

	entry := newEntry()
	if err := row.Scan(); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "The requested entry does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while looking up an entry", err)
	}

	return &entry, nil
}

func GetEntriesByContestantKaid(ctx context.Context, contestantKaid string) ([]*model.Entry, error) {
	entries := []*model.Entry{}

	rows, err := db.DB.Query("SELECT entry_id, contest_id, entry_url, entry_kaid, entry_title, entry_level, entry_votes, to_char(entry_created, $1) as entry_created, entry_height, is_winner, assigned_group_id, flagged, disqualified, entry_author_kaid, entry_level_locked FROM entry WHERE entry_author_kaid = $2 ORDER BY entry_id ASC;", util.DisplayFancyDateFormat, contestantKaid)
	if err != nil {
		return []*model.Entry{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of contestant entries.", err)
	}

	for rows.Next() {
		entry := newEntry()

		if err := rows.Scan(&entry.ID, &entry.Contest.ID, &entry.URL, &entry.Kaid, &entry.Title, &entry.SkillLevel, &entry.Votes, &entry.Created, &entry.Height, &entry.IsWinner, &entry.Group.ID, &entry.IsFlagged, &entry.IsDisqualified, &entry.Author.Kaid, &entry.IsSkillLevelLocked); err != nil {
			return []*model.Entry{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of contestant entries.", err)
		}

		entries = append(entries, &entry)
	}

	return entries, nil
}
