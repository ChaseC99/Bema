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
		var groupId *int
		var authorKaid *string

		if err := rows.Scan(&entry.ID, &entry.Contest.ID, &entry.URL, &entry.Kaid, &entry.Title, &entry.SkillLevel, &entry.Votes, &entry.Created, &entry.Height, &entry.IsWinner, &groupId, &entry.IsFlagged, &entry.IsDisqualified, &authorKaid, &entry.IsSkillLevelLocked); err != nil {
			return []*model.Entry{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of entries.", err)
		}

		if groupId == nil {
			entry.Group = nil
		} else {
			entry.Group.ID = *groupId
		}

		if authorKaid == nil {
			entry.Author = nil
		} else {
			entry.Author.Kaid = *authorKaid
		}

		entries = append(entries, &entry)
	}

	return entries, nil
}

func GetEntriesByAverageScore(ctx context.Context, contestId int) ([]*model.Entry, error) {
	entries := []*model.Entry{}

	rows, err := db.DB.Query("SELECT e.entry_id, e.contest_id, e.entry_url, e.entry_kaid, e.entry_title, e.entry_level, e.entry_votes, to_char(e.entry_created, $1), e.entry_height, e.is_winner, e.assigned_group_id, e.flagged, e.disqualified, e.entry_author_kaid, e.entry_level_locked, AVG(ev.creativity + ev.complexity + ev.execution + ev.interpretation) as avg_score FROM entry e INNER JOIN evaluation ev ON e.entry_id = ev.entry_id WHERE e.contest_id = $2 AND ev.evaluation_complete = true AND e.disqualified = false GROUP BY e.entry_id ORDER BY e.entry_level, avg_score DESC, e.entry_id ASC;", util.DisplayFancyDateFormat, contestId)
	if err != nil {
		return []*model.Entry{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of entries.", err)
	}

	for rows.Next() {
		entry := newEntry()
		var groupId *int
		var authorKaid *string

		if err := rows.Scan(&entry.ID, &entry.Contest.ID, &entry.URL, &entry.Kaid, &entry.Title, &entry.SkillLevel, &entry.Votes, &entry.Created, &entry.Height, &entry.IsWinner, &groupId, &entry.IsFlagged, &entry.IsDisqualified, &authorKaid, &entry.IsSkillLevelLocked, &entry.AverageScore); err != nil {
			return []*model.Entry{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of entries.", err)
		}

		if groupId == nil {
			entry.Group = nil
		} else {
			entry.Group.ID = *groupId
		}

		if authorKaid == nil {
			entry.Author = nil
		} else {
			entry.Author.Kaid = *authorKaid
		}

		entries = append(entries, &entry)
	}

	return entries, nil
}

func GetEntryById(ctx context.Context, id int) (*model.Entry, error) {
	row := db.DB.QueryRow("SELECT entry_id, contest_id, entry_url, entry_kaid, entry_title, entry_level, entry_votes, to_char(entry_created, $1) as entry_created, entry_height, is_winner, assigned_group_id, flagged, disqualified, entry_author_kaid, entry_level_locked FROM entry WHERE entry_id = $2;", util.DisplayFancyDateFormat, id)

	entry := newEntry()
	var groupId *int
	var authorKaid *string
	if err := row.Scan(&entry.ID, &entry.Contest.ID, &entry.URL, &entry.Kaid, &entry.Title, &entry.SkillLevel, &entry.Votes, &entry.Created, &entry.Height, &entry.IsWinner, &groupId, &entry.IsFlagged, &entry.IsDisqualified, &authorKaid, &entry.IsSkillLevelLocked); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "The requested entry does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while looking up an entry", err)
	}

	if groupId == nil {
		entry.Group = nil
	} else {
		entry.Group.ID = *groupId
	}

	if authorKaid == nil {
		entry.Author = nil
	} else {
		entry.Author.Kaid = *authorKaid
	}

	return &entry, nil
}

func GetEntriesByContestantKaid(ctx context.Context, contestantKaid string) ([]*model.Entry, error) {
	entries := []*model.Entry{}

	rows, err := db.DB.Query("SELECT entry_id, contest_id, entry_url, entry_kaid, entry_title, entry_level, entry_votes, to_char(entry_created, $1) as entry_created, entry_height, is_winner, assigned_group_id, flagged, disqualified, entry_author_kaid, entry_level_locked FROM entry WHERE entry_author_kaid = $2 ORDER BY entry_id DESC;", util.DisplayFancyDateFormat, contestantKaid)
	if err != nil {
		return []*model.Entry{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of contestant entries.", err)
	}

	for rows.Next() {
		entry := newEntry()
		var groupId *int
		var authorKaid *string
		if err := rows.Scan(&entry.ID, &entry.Contest.ID, &entry.URL, &entry.Kaid, &entry.Title, &entry.SkillLevel, &entry.Votes, &entry.Created, &entry.Height, &entry.IsWinner, &groupId, &entry.IsFlagged, &entry.IsDisqualified, &authorKaid, &entry.IsSkillLevelLocked); err != nil {
			return []*model.Entry{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of contestant entries.", err)
		}

		if groupId == nil {
			entry.Group = nil
		} else {
			entry.Group.ID = *groupId
		}

		if authorKaid == nil {
			entry.Author = nil
		} else {
			entry.Author.Kaid = *authorKaid
		}

		entries = append(entries, &entry)
	}

	return entries, nil
}

func GetWinningEntriesByContestId(ctx context.Context, contestId int) ([]*model.Entry, error) {
	entries := []*model.Entry{}

	rows, err := db.DB.Query("SELECT entry_id, contest_id, entry_url, entry_kaid, entry_title, entry_level, entry_votes, to_char(entry_created, $1) as entry_created, entry_height, is_winner, assigned_group_id, flagged, disqualified, entry_author_kaid, entry_level_locked FROM entry WHERE contest_id = $2 AND is_winner = true ORDER BY entry_level ASC;", util.DisplayFancyDateFormat, contestId)
	if err != nil {
		return []*model.Entry{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the contest winners.", err)
	}

	for rows.Next() {
		entry := newEntry()

		var groupId *int
		var authorKaid *string

		if err := rows.Scan(&entry.ID, &entry.Contest.ID, &entry.URL, &entry.Kaid, &entry.Title, &entry.SkillLevel, &entry.Votes, &entry.Created, &entry.Height, &entry.IsWinner, &groupId, &entry.IsFlagged, &entry.IsDisqualified, &authorKaid, &entry.IsSkillLevelLocked); err != nil {
			return []*model.Entry{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the contest winners.", err)
		}

		if groupId == nil {
			entry.Group = nil
		} else {
			entry.Group.ID = *groupId
		}

		if authorKaid == nil {
			entry.Author = nil
		} else {
			entry.Author.Kaid = *authorKaid
		}

		entries = append(entries, &entry)
	}

	return entries, nil
}

func GetEntryAverageScore(ctx context.Context, id int) (*float64, error) {
	row := db.DB.QueryRow("SELECT AVG(creativity + complexity + interpretation + execution) as avg_score FROM evaluation WHERE entry_id = $1", id)

	var avgScore *float64
	if err := row.Scan(&avgScore); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "The requested entry does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while determining an entry's average score", err)
	}

	return avgScore, nil
}

func GetFlaggedEntries(ctx context.Context) ([]*model.Entry, error) {
	entries := []*model.Entry{}

	rows, err := db.DB.Query("SELECT entry_id, contest_id, entry_url, entry_kaid, entry_title, entry_level, entry_votes, to_char(entry_created, $1) as entry_created, entry_height, is_winner, assigned_group_id, flagged, disqualified, entry_author_kaid, entry_level_locked FROM entry WHERE flagged = true AND disqualified = false ORDER BY entry_id ASC;", util.DisplayFancyDateFormat)
	if err != nil {
		return []*model.Entry{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of flagged entries.", err)
	}

	for rows.Next() {
		entry := newEntry()
		var groupId *int
		var authorKaid *string

		if err := rows.Scan(&entry.ID, &entry.Contest.ID, &entry.URL, &entry.Kaid, &entry.Title, &entry.SkillLevel, &entry.Votes, &entry.Created, &entry.Height, &entry.IsWinner, &groupId, &entry.IsFlagged, &entry.IsDisqualified, &authorKaid, &entry.IsSkillLevelLocked); err != nil {
			return []*model.Entry{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of flagged entries.", err)
		}

		if groupId == nil {
			entry.Group = nil
		} else {
			entry.Group.ID = *groupId
		}

		if authorKaid == nil {
			entry.Author = nil
		} else {
			entry.Author.Kaid = *authorKaid
		}

		entries = append(entries, &entry)
	}

	return entries, nil
}

func GetEntryEvaluationCount(ctx context.Context, id int) (int, error) {
	row := db.DB.QueryRow("SELECT COUNT(*) FROM evaluation WHERE entry_id = $1 AND evaluation_complete = true;", id)

	var count int
	if err := row.Scan(&count); err != nil {
		if err == sql.ErrNoRows {
			return 0, errors.NewNotFoundError(ctx, "The requested entry does not exist.")
		}
		return 0, errors.NewInternalError(ctx, "An unexpected error occurred while determining an entry's evaluation count", err)
	}

	return count, nil
}

func GetEntryVoteCount(ctx context.Context, id int) (int, error) {
	row := db.DB.QueryRow("SELECT COUNT(*) FROM entry_vote WHERE entry_id = $1;", id)

	var count int
	if err := row.Scan(&count); err != nil {
		if err == sql.ErrNoRows {
			return 0, errors.NewNotFoundError(ctx, "The requested entry does not exist.")
		}
		return 0, errors.NewInternalError(ctx, "An unexpected error occurred while determining an entry's vote count", err)
	}

	return count, nil
}

func GetEntriesPerLevel(ctx context.Context, contestId int) ([]*model.EntriesPerLevel, error) {
	entriesPerLevel := []*model.EntriesPerLevel{}

	rows, err := db.DB.Query("SELECT COUNT(*), entry_level FROM entry WHERE contest_id = $1 AND disqualified = false GROUP BY entry_level;", contestId)
	if err != nil {
		return []*model.EntriesPerLevel{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the number of entries per level.", err)
	}

	for rows.Next() {
		var count model.EntriesPerLevel

		if err := rows.Scan(&count.Count, &count.Level); err != nil {
			return []*model.EntriesPerLevel{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the number of entries per level.", err)
		}

		entriesPerLevel = append(entriesPerLevel, &count)
	}

	return entriesPerLevel, nil
}
