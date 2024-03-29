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

func (r *entryCountsResolver) Flagged(ctx context.Context, obj *model.EntryCounts) (int, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.ViewAdminStats) {
		return 0, nil
	}

	contest, err := models.GetCurrentContest(ctx)
	if err != nil {
		return 0, err
	}

	count, err := models.GetFlaggedEntryCountByContestId(ctx, contest.ID)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (r *entryCountsResolver) Disqualified(ctx context.Context, obj *model.EntryCounts) (int, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.ViewAdminStats) {
		return 0, nil
	}

	contest, err := models.GetCurrentContest(ctx)
	if err != nil {
		return 0, err
	}

	count, err := models.GetDisqualifiedEntryCountByContestId(ctx, contest.ID)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (r *entryCountsResolver) Total(ctx context.Context, obj *model.EntryCounts) (int, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.ViewAdminStats) {
		return 0, nil
	}

	contest, err := models.GetCurrentContest(ctx)
	if err != nil {
		return 0, err
	}

	count, err := models.GetTotalEntryCountByContestId(ctx, contest.ID)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (r *evaluatorProgressResolver) User(ctx context.Context, obj *model.EvaluatorProgress) (*model.User, error) {
	if obj.User == nil {
		return nil, nil
	}

	return r.Query().User(ctx, obj.User.ID)
}

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

func (r *judgingProgressResolver) Evaluators(ctx context.Context, obj *model.JudgingProgress) ([]*model.EvaluatorProgress, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.ViewAdminStats) {
		return nil, nil
	}

	contest, err := models.GetCurrentContest(ctx)
	if err != nil {
		return nil, err
	}

	progress, err := models.GetEvaluatorProgressByContestId(ctx, contest.ID)
	if err != nil {
		return nil, err
	}

	return progress, nil
}

func (r *queryResolver) JudgingProgress(ctx context.Context) (*model.JudgingProgress, error) {
	return &model.JudgingProgress{}, nil
}

func (r *queryResolver) EntryCounts(ctx context.Context) (*model.EntryCounts, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.ViewAdminStats) {
		return nil, nil
	}

	return &model.EntryCounts{}, nil
}

// EntryCounts returns generated.EntryCountsResolver implementation.
func (r *Resolver) EntryCounts() generated.EntryCountsResolver { return &entryCountsResolver{r} }

// EvaluatorProgress returns generated.EvaluatorProgressResolver implementation.
func (r *Resolver) EvaluatorProgress() generated.EvaluatorProgressResolver {
	return &evaluatorProgressResolver{r}
}

// JudgingProgress returns generated.JudgingProgressResolver implementation.
func (r *Resolver) JudgingProgress() generated.JudgingProgressResolver {
	return &judgingProgressResolver{r}
}

type entryCountsResolver struct{ *Resolver }
type evaluatorProgressResolver struct{ *Resolver }
type judgingProgressResolver struct{ *Resolver }
