package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/generated"
	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
	err "github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/models"
)

func (r *announcementResolver) Author(ctx context.Context, obj *model.Announcement) (*model.User, error) {
	user, err := models.GetUserById(ctx, obj.Author.ID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *mutationResolver) CreateAnnouncement(ctx context.Context, input model.AnnouncementInput) (*model.Announcement, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.ManageAnnouncements) {
		return nil, err.NewForbiddenError(ctx, "You do not have permission to create announcements.")
	}

	id, err := models.CreateAnnouncement(ctx, &input, user.ID)
	if err != nil {
		return nil, err
	}

	return r.Query().Announcement(ctx, *id)
}

func (r *mutationResolver) EditAnnouncement(ctx context.Context, id int, input model.AnnouncementInput) (*model.Announcement, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.ManageAnnouncements) {
		return nil, err.NewForbiddenError(ctx, "You do not have permission to edit announcements.")
	}

	err := models.EditAnnouncementById(ctx, id, &input)
	if err != nil {
		return nil, err
	}

	return r.Query().Announcement(ctx, id)
}

func (r *mutationResolver) DeleteAnnouncement(ctx context.Context, id int) (*model.Announcement, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.ManageAnnouncements) {
		return nil, err.NewForbiddenError(ctx, "You do not have permission to delete announcements.")
	}

	announcement, err := r.Query().Announcement(ctx, id)
	if err != nil {
		return nil, err
	}

	err = models.DeleteAnnouncementById(ctx, id)
	if err != nil {
		return nil, err
	}

	return announcement, nil
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

func (r *queryResolver) Announcement(ctx context.Context, id int) (*model.Announcement, error) {
	user := auth.GetUserFromContext(ctx)

	announcement, err := models.GetAnnouncementById(ctx, id)
	if err != nil {
		return nil, err
	}

	if user == nil && !announcement.IsPublic {
		return nil, nil
	}

	return announcement, nil
}

// Announcement returns generated.AnnouncementResolver implementation.
func (r *Resolver) Announcement() generated.AnnouncementResolver { return &announcementResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type announcementResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
