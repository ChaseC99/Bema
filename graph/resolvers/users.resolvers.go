package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/generated"
	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
	errs "github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/models"
)

func (r *mutationResolver) Login(ctx context.Context, username string, password string) (*model.LoginResponse, error) {
	u := auth.GetUserFromContext(ctx)
	if u != nil {
		return nil, errs.NewForbiddenError(ctx, "You're already logged in!")
	}

	// Look up the user by username
	user, err := models.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, err
	}

	// If the user does not exist, failed login
	if user == nil {
		return &model.LoginResponse{
			Success:    false,
			IsDisabled: false,
		}, nil
	}

	// If the user's account is disabled, failed login
	if *user.AccountLocked {
		return &model.LoginResponse{
			Success:    false,
			IsDisabled: true,
		}, nil
	}

	// Retrieve the user's stored password hash
	hash, err := models.GetUserPasswordHashByUsername(ctx, username)
	if err != nil {
		return nil, err
	}

	// Validate the user's provided password
	isValid := auth.ValidateUserLogin(password, *hash)

	// The user provided a correct username / password, so log them in
	if isValid {
		// Generate an auth token
		token := auth.CreateAuthToken(ctx, user.ID)

		return &model.LoginResponse{
			Success:    true,
			IsDisabled: false,
			Token:      token,
		}, nil
	}

	return &model.LoginResponse{
		Success:    false,
		IsDisabled: false,
	}, nil
}

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
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return []*model.User{}, nil
	}

	users, err := models.GetAllActiveUsers(ctx)
	if err != nil {
		return []*model.User{}, err
	}
	return users, nil
}

func (r *queryResolver) InactiveUsers(ctx context.Context) ([]*model.User, error) {
	user := auth.GetUserFromContext(ctx)
	if !auth.HasPermission(user, auth.ViewAllUsers) {
		return []*model.User{}, nil
	}

	users, err := models.GetAllInactiveUsers(ctx)
	if err != nil {
		return []*model.User{}, err
	}
	return users, nil
}

func (r *queryResolver) User(ctx context.Context, id int) (*model.User, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return nil, nil
	}

	u, err := models.GetUserById(ctx, id)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *userResolver) Name(ctx context.Context, obj *model.User) (*string, error) {
	user := auth.GetUserFromContext(ctx)
	if auth.HasPermission(user, auth.ViewAllUsers) || obj.ID == user.ID {
		return obj.Name, nil
	}

	return nil, nil
}

func (r *userResolver) Email(ctx context.Context, obj *model.User) (*string, error) {
	user := auth.GetUserFromContext(ctx)
	if auth.HasPermission(user, auth.ViewAllUsers) || obj.ID == user.ID {
		return obj.Email, nil
	}

	return nil, nil
}

func (r *userResolver) AccountLocked(ctx context.Context, obj *model.User) (*bool, error) {
	user := auth.GetUserFromContext(ctx)
	if auth.HasPermission(user, auth.ViewAllUsers) || obj.ID == user.ID {
		return obj.AccountLocked, nil
	}

	return nil, nil
}

func (r *userResolver) Permissions(ctx context.Context, obj *model.User) (*model.Permissions, error) {
	user := auth.GetUserFromContext(ctx)
	if auth.HasPermission(user, auth.ViewAllUsers) || obj.ID == user.ID {
		permissions, err := models.GetUserPermissionsById(ctx, obj.ID)
		return permissions, err
	}

	return nil, nil
}

func (r *userResolver) IsAdmin(ctx context.Context, obj *model.User) (*bool, error) {
	user := auth.GetUserFromContext(ctx)
	if auth.HasPermission(user, auth.ViewAllUsers) || obj.ID == user.ID {
		return obj.IsAdmin, nil
	}

	return nil, nil
}

func (r *userResolver) LastLogin(ctx context.Context, obj *model.User) (*string, error) {
	user := auth.GetUserFromContext(ctx)
	if auth.HasPermission(user, auth.ViewAllUsers) || obj.ID == user.ID {
		return obj.LastLogin, nil
	}

	return nil, nil
}

func (r *userResolver) NotificationsEnabled(ctx context.Context, obj *model.User) (*bool, error) {
	user := auth.GetUserFromContext(ctx)
	if auth.HasPermission(user, auth.ViewAllUsers) || obj.ID == user.ID {
		return obj.NotificationsEnabled, nil
	}

	return nil, nil
}

func (r *userResolver) AssignedGroup(ctx context.Context, obj *model.User) (*model.JudgingGroup, error) {
	user := auth.GetUserFromContext(ctx)
	if auth.HasPermission(user, auth.ViewJudgingSettings) || obj.ID == user.ID {
		groupId, err := models.GetUserGroupById(ctx, obj.ID)
		if err != nil {
			return nil, err
		}

		if groupId == nil {
			return nil, err
		}

		group, err := models.GetJudgingGroupById(ctx, *groupId)
		if err != nil {
			return nil, err
		}

		return group, nil
	}

	return nil, nil
}

func (r *userResolver) TotalEvaluations(ctx context.Context, obj *model.User) (*int, error) {
	user := auth.GetUserFromContext(ctx)

	if user == nil {
		return nil, nil
	}

	count, err := models.GetUserTotalEvaluations(ctx, obj.ID)
	if err != nil {
		return nil, err
	}
	return count, nil
}

func (r *userResolver) TotalContestsJudged(ctx context.Context, obj *model.User) (*int, error) {
	user := auth.GetUserFromContext(ctx)

	if user == nil {
		return nil, nil
	}

	count, err := models.GetUserTotalContestsJudged(ctx, obj.ID)
	if err != nil {
		return nil, err
	}
	return count, nil
}

// User returns generated.UserResolver implementation.
func (r *Resolver) User() generated.UserResolver { return &userResolver{r} }

type userResolver struct{ *Resolver }
