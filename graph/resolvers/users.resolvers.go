package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/generated"
	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
	"github.com/KA-Challenge-Council/Bema/internal/models/users"
)

func (r *queryResolver) CurrentUser(ctx context.Context) (*model.FullUserProfile, error) {
	var userProfile *model.FullUserProfile

	user := auth.GetUserFromContext(ctx)

	if user == nil {
		userProfile = &model.FullUserProfile{
			IsAdmin:        false,
			IsImpersonated: false,
			LoggedIn:       false,
			OriginKaid:     nil,
			User:           nil,
		}
	} else {
		userProfile = &model.FullUserProfile{
			IsAdmin:        user.IsAdmin,
			IsImpersonated: user.IsImpersonated,
			LoggedIn:       true,
			OriginKaid:     user.OriginKaid,
			User: &model.User{
				ID:            user.ID,
				Kaid:          user.Kaid,
				Name:          &user.Name,
				Nickname:      &user.Nickname,
				Username:      &user.Username,
				Email:         &user.Email,
				AccountLocked: &user.AccountLocked,
				IsAdmin:       &user.IsAdmin,
				Permissions: &model.Permissions{
					AddEntries:            user.Permissions.AddEntries,
					AddUsers:              user.Permissions.AddUsers,
					AssignEntryGroups:     user.Permissions.AssignEntryGroups,
					AssignEvaluatorGroups: user.Permissions.AssignEvaluatorGroups,
					AssumeUserIdentities:  user.Permissions.AssumeUserIdentities,
					ChangeUserPasswords:   user.Permissions.ChangeUserPasswords,
					DeleteAllEvaluations:  user.Permissions.DeleteAllEvaluations,
					DeleteAllTasks:        user.Permissions.DeleteAllTasks,
					DeleteContests:        user.Permissions.DeleteContests,
					DeleteEntries:         user.Permissions.DeleteEntries,
					DeleteErrors:          user.Permissions.DeleteErrors,
					DeleteKbContent:       user.Permissions.DeleteKbContent,
					EditAllEvaluations:    user.Permissions.EditAllEvaluations,
					EditAllTasks:          user.Permissions.EditAllTasks,
					EditContests:          user.Permissions.EditContests,
					EditEntries:           user.Permissions.EditEntries,
					EditKbContent:         user.Permissions.EditKbContent,
					EditUserProfiles:      user.Permissions.EditUserProfiles,
					JudgeEntries:          user.Permissions.JudgeEntries,
					ManageAnnouncements:   user.Permissions.ManageAnnouncements,
					ManageJudgingCriteria: user.Permissions.ManageJudgingCriteria,
					ManageJudgingGroups:   user.Permissions.ManageJudgingGroups,
					ManageWinners:         user.Permissions.ManageWinners,
					PublishKbContent:      user.Permissions.PublishKbContent,
					ViewAdminStats:        user.Permissions.ViewAdminStats,
					ViewAllEvaluations:    user.Permissions.ViewAllEvaluations,
					ViewAllTasks:          user.Permissions.ViewAllTasks,
					ViewAllUsers:          user.Permissions.ViewAllUsers,
					ViewErrors:            user.Permissions.ViewErrors,
					ViewJudgingSettings:   user.Permissions.ViewJudgingSettings,
				},
			},
		}
	}

	return userProfile, nil
}

func (r *queryResolver) Users(ctx context.Context) ([]*model.User, error) {
	users, err := users.GetAllUsers(ctx)
	if err != nil {
		return []*model.User{}, err
	}
	return users, nil
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
	permissions, err := users.GetUserPermissionsById(ctx, obj.ID)
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
