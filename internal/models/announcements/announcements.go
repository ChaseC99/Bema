package announcements

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/util"
)

func GetAllAnnouncements(ctx context.Context) ([]*model.Announcement, error) {
	announcements := []*model.Announcement{}

	rows, err := db.DB.Query("SELECT m.message_id, to_char(m.message_date, $1), m.message_title, m.message_content, m.public, m.author_id FROM messages m;", util.DisplayDateFormat)
	if err != nil {
		return []*model.Announcement{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of announcements.", err)
	}

	for rows.Next() {
		var a model.Announcement
		a.Author = &model.User{}
		if err := rows.Scan(&a.ID, &a.Created, &a.Title, &a.Content, &a.IsPublic, &a.Author.ID); err != nil {
			return []*model.Announcement{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of announcements.", err)
		}
		announcements = append(announcements, &a)
	}

	return announcements, nil
}

func GetPublicAnnouncements(ctx context.Context) ([]*model.Announcement, error) {
	announcements := []*model.Announcement{}

	rows, err := db.DB.Query("SELECT m.message_id, to_char(m.message_date, $1), m.message_title, m.message_content, m.public, m.author_id FROM messages m WHERE m.public = true;", util.DisplayDateFormat)
	if err != nil {
		return []*model.Announcement{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of announcements.", err)
	}

	for rows.Next() {
		var a model.Announcement
		a.Author = &model.User{}
		if err := rows.Scan(&a.ID, &a.Created, &a.Title, &a.Content, &a.IsPublic, &a.Author.ID); err != nil {
			return []*model.Announcement{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of announcements.", err)
		}
		announcements = append(announcements, &a)
	}

	return announcements, nil
}
