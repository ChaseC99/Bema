package contests

import (
	"context"
	"database/sql"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/util"
)

func GetAllContests(ctx context.Context) ([]*model.Contest, error) {
	contests := []*model.Contest{}

	rows, err := db.DB.Query("SELECT contest_id, contest_name, contest_url, contest_author, to_char(date_start, $1) as date_start, to_char(date_end, $1) as date_end, current, voting_enabled, badge_name, badge_image_url FROM contest ORDER BY contest_id DESC;", util.DisplayDateFormat)
	if err != nil {
		return contests, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of contests", err)
	}

	for rows.Next() {
		var c model.Contest
		if err := rows.Scan(&c.ID, &c.Name, &c.URL, &c.Author, &c.StartDate, &c.EndDate, &c.IsCurrent, &c.IsVotingEnabled, &c.BadgeSlug, &c.BadgeImageURL); err != nil {
			return []*model.Contest{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of contests", err)
		}
		contests = append(contests, &c)
	}

	return contests, nil
}

func GetContest(ctx context.Context, id int) (*model.Contest, error) {
	row := db.DB.QueryRow("SELECT contest_id, contest_name, contest_url, contest_author, to_char(date_start, $1) as date_start, to_char(date_end, $1) as date_end, current, voting_enabled, badge_name, badge_image_url FROM contest WHERE contest_id = $2;", util.DisplayDateFormat, id)

	c := &model.Contest{}
	if err := row.Scan(&c.ID, &c.Name, &c.URL, &c.Author, &c.StartDate, &c.EndDate, &c.IsCurrent, &c.IsVotingEnabled, &c.BadgeSlug, &c.BadgeImageURL); err != nil {
		if err == sql.ErrNoRows {
			// return nil, errors.NewNotFoundError("This contest does not exist")
			return nil, errors.NewInternalError(ctx, "An unexpected error occurred while looking up a contest", err)
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while looking up a contest", err)
	}

	return c, nil
}

func GetCurrentContest(ctx context.Context) (*model.Contest, error) {
	row := db.DB.QueryRow("SELECT contest_id, contest_name, contest_url, contest_author, to_char(date_start, $1) as date_start, to_char(date_end, $1) as date_end, current, voting_enabled, badge_name, badge_image_url FROM contest ORDER BY contest_id DESC LIMIT 1;", util.DisplayDateFormat)

	c := &model.Contest{}
	if err := row.Scan(&c.ID, &c.Name, &c.URL, &c.Author, &c.StartDate, &c.EndDate, &c.IsCurrent, &c.IsVotingEnabled, &c.BadgeSlug, &c.BadgeImageURL); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError("No contests have been created yet")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while looking up the current contest", err)
	}

	return c, nil
}
