package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/KA-Challenge-Council/Bema/graph/generated"
	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
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
				ID:            fmt.Sprint(user.ID),
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

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type queryResolver struct{ *Resolver }
