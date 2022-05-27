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

func (r *queryResolver) CurrentUser(ctx context.Context) (*model.FullUserProfile, error) {
	user := auth.GetUserFromContext(ctx)

	if user == nil {
		return &model.FullUserProfile{
			IsAdmin:        false,
			IsImpersonated: false,
			LoggedIn:       false,
			OriginKaid:     nil,
			User:           nil,
		}, nil
	} else {
		userData, err := r.Query().User(ctx, user.ID)
		if err != nil {
			return nil, err
		}

		return &model.FullUserProfile{
			IsAdmin:        *userData.IsAdmin,
			IsImpersonated: user.IsImpersonated,
			LoggedIn:       true,
			OriginKaid:     user.OriginKaid,
			User:           userData,
		}, nil
	}
}

func (r *queryResolver) Users(ctx context.Context) ([]*model.User, error) {
	users, err := models.GetAllActiveUsers(ctx)
	if err != nil {
		return []*model.User{}, err
	}
	return users, nil
}

func (r *queryResolver) InactiveUsers(ctx context.Context) ([]*model.User, error) {
	users, err := models.GetAllInactiveUsers(ctx)
	if err != nil {
		return []*model.User{}, err
	}
	return users, nil
}

func (r *queryResolver) User(ctx context.Context, id int) (*model.User, error) {
	user, err := models.GetUserById(ctx, id)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userResolver) Name(ctx context.Context, obj *model.User) (*string, error) {
	return obj.Name, nil
}

func (r *userResolver) Email(ctx context.Context, obj *model.User) (*string, error) {
	return obj.Email, nil
}

func (r *userResolver) AccountLocked(ctx context.Context, obj *model.User) (*bool, error) {
	return obj.AccountLocked, nil
}

func (r *userResolver) Permissions(ctx context.Context, obj *model.User) (*model.Permissions, error) {
	permissions, err := models.GetUserPermissionsById(ctx, obj.ID)
	return permissions, err
}

func (r *userResolver) IsAdmin(ctx context.Context, obj *model.User) (*bool, error) {
	return obj.IsAdmin, nil
}

func (r *userResolver) LastLogin(ctx context.Context, obj *model.User) (*string, error) {
	return obj.LastLogin, nil
}

func (r *userResolver) NotificationsEnabled(ctx context.Context, obj *model.User) (*bool, error) {
	return obj.NotificationsEnabled, nil
}

// User returns generated.UserResolver implementation.
func (r *Resolver) User() generated.UserResolver { return &userResolver{r} }

type userResolver struct{ *Resolver }
