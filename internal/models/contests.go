package models

import (
	"context"
	"database/sql"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/util"
)

func NewContestModel() model.Contest {
	contest := model.Contest{}
	contest.Winners = []*model.Entry{}

	return contest
}

func GetAllContests(ctx context.Context) ([]*model.Contest, error) {
	contests := []*model.Contest{}

	rows, err := db.DB.Query("SELECT contest_id, contest_name, contest_url, contest_author, to_char(date_start, $1) as date_start, to_char(date_end, $1) as date_end, current, voting_enabled, badge_name, badge_image_url FROM contest ORDER BY contest_id DESC;", util.DisplayDateFormat)
	if err != nil {
		return contests, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of contests", err)
	}

	for rows.Next() {
		c := NewContestModel()
		if err := rows.Scan(&c.ID, &c.Name, &c.URL, &c.Author, &c.StartDate, &c.EndDate, &c.IsCurrent, &c.IsVotingEnabled, &c.BadgeSlug, &c.BadgeImageURL); err != nil {
			return []*model.Contest{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of contests", err)
		}
		contests = append(contests, &c)
	}

	return contests, nil
}

func GetContestById(ctx context.Context, id int) (*model.Contest, error) {
	row := db.DB.QueryRow("SELECT contest_id, contest_name, contest_url, contest_author, to_char(date_start, $1) as date_start, to_char(date_end, $1) as date_end, current, voting_enabled, badge_name, badge_image_url FROM contest WHERE contest_id = $2;", util.DisplayDateFormat, id)

	c := NewContestModel()
	if err := row.Scan(&c.ID, &c.Name, &c.URL, &c.Author, &c.StartDate, &c.EndDate, &c.IsCurrent, &c.IsVotingEnabled, &c.BadgeSlug, &c.BadgeImageURL); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "Oops! This contest does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while looking up a contest", err)
	}

	return &c, nil
}

func GetCurrentContest(ctx context.Context) (*model.Contest, error) {
	row := db.DB.QueryRow("SELECT contest_id, contest_name, contest_url, contest_author, to_char(date_start, $1) as date_start, to_char(date_end, $1) as date_end, current, voting_enabled, badge_name, badge_image_url FROM contest ORDER BY contest_id DESC LIMIT 1;", util.DisplayDateFormat)

	c := NewContestModel()
	if err := row.Scan(&c.ID, &c.Name, &c.URL, &c.Author, &c.StartDate, &c.EndDate, &c.IsCurrent, &c.IsVotingEnabled, &c.BadgeSlug, &c.BadgeImageURL); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "Oops! No contests have been created yet.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while looking up the current contest", err)
	}

	return &c, nil
}

func GetContestsEvaluatedByUser(ctx context.Context, userId int) ([]*model.Contest, error) {
	contests := []*model.Contest{}

	rows, err := db.DB.Query("SELECT c.contest_id, c.contest_name, c.contest_url, c.contest_author, to_char(c.date_start, $1) as date_start, to_char(c.date_end, $1) as date_end, c.current, c.voting_enabled, c.badge_name, c.badge_image_url FROM contest c INNER JOIN entry en ON en.contest_id = c.contest_id INNER JOIN evaluation ev ON ev.entry_id = en.entry_id WHERE ev.evaluator_id = $2 AND ev.evaluation_complete = true GROUP BY c.contest_id ORDER BY c.contest_id DESC;", util.DisplayDateFormat, userId)
	if err != nil {
		return []*model.Contest{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of contests evaluated by the user", err)
	}

	for rows.Next() {
		c := NewContestModel()
		if err := rows.Scan(&c.ID, &c.Name, &c.URL, &c.Author, &c.StartDate, &c.EndDate, &c.IsCurrent, &c.IsVotingEnabled, &c.BadgeSlug, &c.BadgeImageURL); err != nil {
			return []*model.Contest{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of contests evaluated by the user", err)
		}
		contests = append(contests, &c)
	}

	return contests, nil
}

func CreateContest(ctx context.Context, input *model.CreateContestInput) (*int, error) {
	var id int
	row := db.DB.QueryRow("INSERT INTO contest (contest_name, contest_url, contest_author, date_start, date_end, current) VALUES ($1, $2, $3, $4, $5, $6) RETURNING contest_id;", input.Name, input.URL, input.Author, input.StartDate, input.EndDate, input.IsCurrent)
	if err := row.Scan(&id); err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while creating a contest", err)
	}

	return &id, nil
}

func EditContestById(ctx context.Context, id int, input *model.EditContestInput) error {
	_, err := db.DB.Exec("UPDATE contest SET contest_name = $1, contest_url = $2, contest_author = $3, date_start = $4, date_end = $5, current = $6, voting_enabled = $7, badge_name = $8, badge_image_url = $9 WHERE contest_id = $10", input.Name, input.URL, input.Author, input.StartDate, input.EndDate, input.IsCurrent, input.IsVotingEnabled, input.BadgeSlug, input.BadgeImageURL, id)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while editing a contest", err)
	}
	return nil
}
