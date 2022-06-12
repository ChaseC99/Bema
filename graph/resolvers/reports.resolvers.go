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

func (r *judgingProgressResolver) User(ctx context.Context, obj *model.JudgingProgress) (*model.Progress, error) {
	user := auth.GetUserFromContext(ctx)

	if user == nil {
		return &model.Progress{
			Count: 10,
			Total: 50,
		}, nil
	}

	contest, err := models.GetCurrentContest(ctx)
	if err != nil {
		return nil, err
	}

	progress, err := models.GetUserProgressByContestId(ctx, user.ID, contest.ID)
	if err != nil {
		return nil, err
	}
	return progress, nil
}

func (r *judgingProgressResolver) Group(ctx context.Context, obj *model.JudgingProgress) (*model.Progress, error) {
	user := auth.GetUserFromContext(ctx)

	if user == nil {
		return &model.Progress{
			Count: 80,
			Total: 150,
		}, nil
	}

	groupId, err := models.GetUserGroupById(ctx, user.ID)
	if err != nil {
		return nil, err
	}
	if groupId == nil {
		return &model.Progress{
			Count: 0,
			Total: 0,
		}, nil
	}

	contest, err := models.GetCurrentContest(ctx)
	if err != nil {
		return nil, err
	}

	progress, err := models.GetGroupProgressByContestId(ctx, *groupId, contest.ID)
	if err != nil {
		return nil, err
	}

	return progress, nil
}

func (r *judgingProgressResolver) Entries(ctx context.Context, obj *model.JudgingProgress) (*model.Progress, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.ViewAdminStats) {
		return nil, nil
	}

	contest, err := models.GetCurrentContest(ctx)
	if err != nil {
		return nil, err
	}

	progress, err := models.GetEntryProgressByContestId(ctx, contest.ID)
	if err != nil {
		return nil, err
	}

	return progress, nil
}

func (r *judgingProgressResolver) Evaluations(ctx context.Context, obj *model.JudgingProgress) (*model.Progress, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.ViewAdminStats) {
		return nil, nil
	}

	contest, err := models.GetCurrentContest(ctx)
	if err != nil {
		return nil, err
	}

	progress, err := models.GetEvaluationProgressByContestId(ctx, contest.ID)
	if err != nil {
		return nil, err
	}

	return progress, nil
}

func (r *queryResolver) JudgingProgress(ctx context.Context) (*model.JudgingProgress, error) {
	return &model.JudgingProgress{}, nil
}

// JudgingProgress returns generated.JudgingProgressResolver implementation.
func (r *Resolver) JudgingProgress() generated.JudgingProgressResolver {
	return &judgingProgressResolver{r}
}

type judgingProgressResolver struct{ *Resolver }
