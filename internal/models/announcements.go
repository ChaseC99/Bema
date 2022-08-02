package models

import (
	"context"
	"database/sql"
	"time"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/util"
)

func NewAnnouncementModel() model.Announcement {
	announcement := model.Announcement{}
	user := NewUserModel()
	announcement.Author = &user

	return announcement
}

func GetAnnouncementById(ctx context.Context, id int) (*model.Announcement, error) {
	row := db.DB.QueryRow("SELECT m.message_id, to_char(m.message_date, $1), m.message_title, m.message_content, m.public, m.author_id FROM messages m WHERE m.message_id = $2;", util.DisplayDateFormat, id)

	a := NewAnnouncementModel()
	if err := row.Scan(&a.ID, &a.Created, &a.Title, &a.Content, &a.IsPublic, &a.Author.ID); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "Oops! The requested announcement does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the requested announcement", err)
	}

	return &a, nil
}

func GetAllAnnouncements(ctx context.Context) ([]*model.Announcement, error) {
	announcements := []*model.Announcement{}

	rows, err := db.DB.Query("SELECT m.message_id, to_char(m.message_date, $1), m.message_title, m.message_content, m.public, m.author_id FROM messages m;", util.DisplayDateFormat)
	if err != nil {
		return []*model.Announcement{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of announcements.", err)
	}

	for rows.Next() {
		a := NewAnnouncementModel()
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
		a := NewAnnouncementModel()
		if err := rows.Scan(&a.ID, &a.Created, &a.Title, &a.Content, &a.IsPublic, &a.Author.ID); err != nil {
			return []*model.Announcement{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of announcements.", err)
		}
		announcements = append(announcements, &a)
	}

	return announcements, nil
}

func CreateAnnouncement(ctx context.Context, input *model.AnnouncementInput, authorId int) (*int, error) {
	var id int
	row := db.DB.QueryRow("INSERT INTO messages (author_id, message_date, message_title, message_content, public) VALUES ($1, $2, $3, $4, $5) RETURNING message_id;", authorId, time.Now(), input.Title, input.Content, input.IsPublic)
	if err := row.Scan(&id); err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while creating an announcement", err)
	}

	return &id, nil
}

func EditAnnouncementById(ctx context.Context, id int, input *model.AnnouncementInput) error {
	_, err := db.DB.Exec("UPDATE messages SET message_title = $1, message_content = $2, public = $3 WHERE message_id = $4", input.Title, input.Content, input.IsPublic, id)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while editing an announcement", err)
	}

	return nil
}

func DeleteAnnouncementById(ctx context.Context, id int) error {
	_, err := db.DB.Exec("DELETE FROM messages WHERE message_id = $1", id)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while delete an announcement", err)
	}

	return nil
}
