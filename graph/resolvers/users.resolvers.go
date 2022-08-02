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

func (r *mutationResolver) Logout(ctx context.Context) (bool, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return false, nil
	}

	err := auth.RemoveAuthTokensForUser(ctx, user.ID)
	if err != nil {
		return false, errs.NewInternalError(ctx, "An unexpected error occurred while logging out a user", err)
	}

	return true, nil
}

func (r *mutationResolver) ChangePassword(ctx context.Context, id int, password string) (bool, error) {
	user := auth.GetUserFromContext(ctx)

	if user.ID != id && !auth.HasPermission(user, auth.ChangeUserPasswords) {
		return false, errs.NewForbiddenError(ctx, "You do not have permission to change user passwords.")
	}

	err := models.ChangeUserPasswordById(ctx, id, password)
	if err != nil {
		return false, err
	}

	return true, nil
}

func (r *mutationResolver) CreateUser(ctx context.Context, input model.CreateUserInput) (*model.User, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.AddUsers) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to create users.")
	}

	id, err := models.CreateUser(ctx, &input)
	if err != nil {
		return nil, err
	}

	return r.Query().User(ctx, *id)
}

func (r *mutationResolver) EditUserProfile(ctx context.Context, id int, input model.EditUserProfileInput) (*model.User, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditUserProfiles) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to edit user profiles")
	}

	u, err := r.Query().User(ctx, id)
	if err != nil {
		return nil, err
	}

	if !user.IsAdmin {
		input.IsAdmin = *u.IsAdmin
		input.AccountLocked = *u.AccountLocked
	}

	if !user.IsAdmin && !auth.HasPermission(user, auth.EditUserProfiles) {
		input.Kaid = u.Kaid
		input.Name = *u.Name
		input.TermStart = *u.TermStart
		input.TermEnd = u.TermEnd
	}

	err = models.EditUserById(ctx, id, &input)
	if err != nil {
		return nil, err
	}

	return r.Query().User(ctx, id)
}

func (r *mutationResolver) EditUserPermissions(ctx context.Context, id int, input model.EditUserPermissionsInput) (*model.Permissions, error) {
	user := auth.GetUserFromContext(ctx)

	if user == nil || !user.IsAdmin {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to edit user permissions.")
	}

	err := models.EditUserPermissionsById(ctx, id, &input)
	if err != nil {
		return nil, err
	}

	permissions, err := models.GetUserPermissionsById(ctx, id)
	if err != nil {
		return nil, err
	}

	return permissions, nil
}

func (r *mutationResolver) AssignUserToJudgingGroup(ctx context.Context, userID int, groupID *int) (bool, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.AssignEvaluatorGroups) {
		return false, errs.NewForbiddenError(ctx, "You do not have permission to assign evaluators to groups.")
	}

	err := models.AssignUserToJudgingGroup(ctx, userID, groupID)
	if err != nil {
		return false, err
	}

	return true, nil
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