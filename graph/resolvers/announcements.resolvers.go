package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/generated"
	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
	"github.com/KA-Challenge-Council/Bema/internal/models"
)

func (r *announcementResolver) Author(ctx context.Context, obj *model.Announcement) (*model.User, error) {
	user, err := models.GetUserById(ctx, obj.Author.ID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *queryResolver) Announcements(ctx context.Context) ([]*model.Announcement, error) {
	// If the user is logged in, return all messages. Otherwise, return only public messages
	user := auth.GetUserFromContext(ctx)
	if user != nil {
		announcements, err := models.GetAllAnnouncements(ctx)
		if err != nil {
			return []*model.Announcement{}, err
		}
		return announcements, nil
	} else {
		announcements, err := models.GetPublicAnnouncements(ctx)
		if err != nil {
			return []*model.Announcement{}, err
		}
		return announcements, nil
	}
}

// Announcement returns generated.AnnouncementResolver implementation.
func (r *Resolver) Announcement() generated.AnnouncementResolver { return &announcementResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type announcementResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
